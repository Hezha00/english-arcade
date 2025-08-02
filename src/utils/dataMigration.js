// Data migration utilities
import React from 'react';
import { supabase } from '../supabaseClient';
import { handleError, ERROR_TYPES, ERROR_SEVERITY } from './errorHandler';

// Migration configuration
const MIGRATION_CONFIG = {
    BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 30000
};

// Migration status tracking
class MigrationTracker {
    constructor() {
        this.migrations = new Map();
        this.currentMigration = null;
    }

    startMigration(name, description) {
        const migration = {
            name,
            description,
            startTime: Date.now(),
            status: 'running',
            progress: 0,
            totalSteps: 0,
            completedSteps: 0,
            errors: [],
            warnings: []
        };

        this.migrations.set(name, migration);
        this.currentMigration = migration;

        console.log(`🚀 Starting migration: ${name} - ${description}`);
        return migration;
    }

    updateProgress(completed, total) {
        if (this.currentMigration) {
            this.currentMigration.completedSteps = completed;
            this.currentMigration.totalSteps = total;
            this.currentMigration.progress = Math.round((completed / total) * 100);
        }
    }

    addError(error, context = {}) {
        if (this.currentMigration) {
            this.currentMigration.errors.push({
                message: error.message || error.toString(),
                context,
                timestamp: new Date().toISOString()
            });
        }
    }

    addWarning(warning, context = {}) {
        if (this.currentMigration) {
            this.currentMigration.warnings.push({
                message: warning,
                context,
                timestamp: new Date().toISOString()
            });
        }
    }

    completeMigration(success = true) {
        if (this.currentMigration) {
            this.currentMigration.status = success ? 'completed' : 'failed';
            this.currentMigration.endTime = Date.now();
            this.currentMigration.duration = this.currentMigration.endTime - this.currentMigration.startTime;
        }
    }

    getMigrationStatus(name) {
        return this.migrations.get(name);
    }

    getAllMigrations() {
        return Array.from(this.migrations.values());
    }
}

// Global migration tracker
export const migrationTracker = new MigrationTracker();

// Data migration utilities
export const dataMigration = {
    // Migrate classroom references from text to UUID
    async migrateClassroomReferences() {
        const migration = migrationTracker.startMigration(
            'classroom_references',
            'Migrate classroom references from text to UUID'
        );

        try {
            // Step 1: Get all students with classroom text but no classroom_id
            const { data: students, error: fetchError } = await supabase
                .from('students')
                .select('id, classroom, teacher_id, school, year_level')
                .not('classroom', 'is', null)
                .is('classroom_id', null);

            if (fetchError) {
                throw fetchError;
            }

            migration.totalSteps = students.length;
            console.log(`📊 Found ${students.length} students to migrate`);

            let completed = 0;
            const errors = [];

            // Step 2: Process students in batches
            for (let i = 0; i < students.length; i += MIGRATION_CONFIG.BATCH_SIZE) {
                const batch = students.slice(i, i + MIGRATION_CONFIG.BATCH_SIZE);

                for (const student of batch) {
                    try {
                        // Find or create classroom
                        const { data: existingClassrooms, error: searchError } = await supabase
                            .from('classrooms')
                            .select('id')
                            .eq('name', student.classroom)
                            .eq('teacher_id', student.teacher_id)
                            .maybeSingle();

                        if (searchError) {
                            throw searchError;
                        }

                        let classroomId = null;

                        if (existingClassrooms) {
                            classroomId = existingClassrooms.id;
                        } else {
                            // Create new classroom
                            const { data: newClassroom, error: createError } = await supabase
                                .from('classrooms')
                                .insert({
                                    name: student.classroom,
                                    teacher_id: student.teacher_id,
                                    school: student.school,
                                    year_level: student.year_level
                                })
                                .select('id')
                                .single();

                            if (createError) {
                                throw createError;
                            }

                            classroomId = newClassroom.id;
                        }

                        // Update student with classroom_id
                        const { error: updateError } = await supabase
                            .from('students')
                            .update({ classroom_id: classroomId })
                            .eq('id', student.id);

                        if (updateError) {
                            throw updateError;
                        }

                        completed++;
                        migrationTracker.updateProgress(completed, students.length);

                    } catch (error) {
                        errors.push({
                            studentId: student.id,
                            error: error.message,
                            classroom: student.classroom
                        });
                        migrationTracker.addError(error, { studentId: student.id });
                    }
                }
            }

            migrationTracker.completeMigration(errors.length === 0);

            console.log(`✅ Migration completed: ${completed} students processed, ${errors.length} errors`);

            return {
                success: errors.length === 0,
                processed: completed,
                errors,
                migration
            };

        } catch (error) {
            migrationTracker.addError(error);
            migrationTracker.completeMigration(false);
            throw error;
        }
    },

    // Clean up orphaned records
    async cleanupOrphanedRecords() {
        const migration = migrationTracker.startMigration(
            'orphaned_records',
            'Clean up orphaned records'
        );

        try {
            const cleanupTasks = [
                this.cleanupOrphanedStudents(),
                this.cleanupOrphanedAssignments(),
                this.cleanupOrphanedResults(),
                this.cleanupOrphanedGames()
            ];

            migration.totalSteps = cleanupTasks.length;
            let completed = 0;

            const results = [];

            for (const task of cleanupTasks) {
                try {
                    const result = await task;
                    results.push(result);
                    completed++;
                    migrationTracker.updateProgress(completed, cleanupTasks.length);
                } catch (error) {
                    migrationTracker.addError(error);
                    results.push({ success: false, error: error.message });
                }
            }

            migrationTracker.completeMigration(true);

            return {
                success: results.every(r => r.success),
                results,
                migration
            };

        } catch (error) {
            migrationTracker.addError(error);
            migrationTracker.completeMigration(false);
            throw error;
        }
    },

    // Clean up orphaned students
    async cleanupOrphanedStudents() {
        const { data: orphanedStudents, error } = await supabase
            .from('students')
            .select('id, name')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        if (orphanedStudents.length > 0) {
            const { error: deleteError } = await supabase
                .from('students')
                .delete()
                .is('teacher_id', null);

            if (deleteError) {
                throw deleteError;
            }
        }

        return {
            success: true,
            cleaned: orphanedStudents.length,
            type: 'students'
        };
    },

    // Clean up orphaned assignments
    async cleanupOrphanedAssignments() {
        const { data: orphanedAssignments, error } = await supabase
            .from('assignments')
            .select('id, title')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        if (orphanedAssignments.length > 0) {
            const { error: deleteError } = await supabase
                .from('assignments')
                .delete()
                .is('teacher_id', null);

            if (deleteError) {
                throw deleteError;
            }
        }

        return {
            success: true,
            cleaned: orphanedAssignments.length,
            type: 'assignments'
        };
    },

    // Clean up orphaned results
    async cleanupOrphanedResults() {
        const { data: orphanedResults, error } = await supabase
            .from('results')
            .select('id')
            .is('student_id', null);

        if (error) {
            throw error;
        }

        if (orphanedResults.length > 0) {
            const { error: deleteError } = await supabase
                .from('results')
                .delete()
                .is('student_id', null);

            if (deleteError) {
                throw deleteError;
            }
        }

        return {
            success: true,
            cleaned: orphanedResults.length,
            type: 'results'
        };
    },

    // Clean up orphaned games
    async cleanupOrphanedGames() {
        const { data: orphanedGames, error } = await supabase
            .from('games')
            .select('id, title')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        if (orphanedGames.length > 0) {
            const { error: deleteError } = await supabase
                .from('games')
                .delete()
                .is('teacher_id', null);

            if (deleteError) {
                throw deleteError;
            }
        }

        return {
            success: true,
            cleaned: orphanedGames.length,
            type: 'games'
        };
    },

    // Validate data integrity
    async validateDataIntegrity() {
        const migration = migrationTracker.startMigration(
            'data_integrity',
            'Validate data integrity'
        );

        try {
            const validations = [
                this.validateStudentIntegrity(),
                this.validateAssignmentIntegrity(),
                this.validateResultIntegrity(),
                this.validateGameIntegrity()
            ];

            migration.totalSteps = validations.length;
            let completed = 0;

            const results = [];

            for (const validation of validations) {
                try {
                    const result = await validation;
                    results.push(result);
                    completed++;
                    migrationTracker.updateProgress(completed, validations.length);
                } catch (error) {
                    migrationTracker.addError(error);
                    results.push({ success: false, error: error.message });
                }
            }

            migrationTracker.completeMigration(true);

            return {
                success: results.every(r => r.success),
                results,
                migration
            };

        } catch (error) {
            migrationTracker.addError(error);
            migrationTracker.completeMigration(false);
            throw error;
        }
    },

    // Validate student data integrity
    async validateStudentIntegrity() {
        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, teacher_id, classroom_id')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        return {
            success: true,
            invalidStudents: students.length,
            type: 'students'
        };
    },

    // Validate assignment data integrity
    async validateAssignmentIntegrity() {
        const { data: assignments, error } = await supabase
            .from('assignments')
            .select('id, title, teacher_id')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        return {
            success: true,
            invalidAssignments: assignments.length,
            type: 'assignments'
        };
    },

    // Validate result data integrity
    async validateResultIntegrity() {
        const { data: results, error } = await supabase
            .from('results')
            .select('id, student_id')
            .is('student_id', null);

        if (error) {
            throw error;
        }

        return {
            success: true,
            invalidResults: results.length,
            type: 'results'
        };
    },

    // Validate game data integrity
    async validateGameIntegrity() {
        const { data: games, error } = await supabase
            .from('games')
            .select('id, title, teacher_id')
            .is('teacher_id', null);

        if (error) {
            throw error;
        }

        return {
            success: true,
            invalidGames: games.length,
            type: 'games'
        };
    },

    // Run all migrations
    async runAllMigrations() {
        console.log('🔄 Starting all data migrations...');

        const migrations = [
            { name: 'classroom_references', fn: this.migrateClassroomReferences },
            { name: 'orphaned_records', fn: this.cleanupOrphanedRecords },
            { name: 'data_integrity', fn: this.validateDataIntegrity }
        ];

        const results = [];

        for (const migration of migrations) {
            try {
                console.log(`🔄 Running migration: ${migration.name}`);
                const result = await migration.fn.call(this);
                results.push({ name: migration.name, ...result });
                console.log(`✅ Migration ${migration.name} completed`);
            } catch (error) {
                console.error(`❌ Migration ${migration.name} failed:`, error);
                results.push({ name: migration.name, success: false, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`🎉 Migrations completed: ${successCount}/${results.length} successful`);

        return {
            success: results.every(r => r.success),
            results,
            summary: {
                total: results.length,
                successful: successCount,
                failed: results.length - successCount
            }
        };
    }
};

// Migration hook for React components
export const useMigration = () => {
    const [isRunning, setIsRunning] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [currentMigration, setCurrentMigration] = React.useState(null);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (migrationTracker.currentMigration) {
                setProgress(migrationTracker.currentMigration.progress);
                setCurrentMigration(migrationTracker.currentMigration);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const runMigration = React.useCallback(async (migrationName) => {
        setIsRunning(true);
        setProgress(0);

        try {
            let result;

            switch (migrationName) {
                case 'classroom_references':
                    result = await dataMigration.migrateClassroomReferences();
                    break;
                case 'orphaned_records':
                    result = await dataMigration.cleanupOrphanedRecords();
                    break;
                case 'data_integrity':
                    result = await dataMigration.validateDataIntegrity();
                    break;
                case 'all':
                    result = await dataMigration.runAllMigrations();
                    break;
                default:
                    throw new Error(`Unknown migration: ${migrationName}`);
            }

            return result;
        } finally {
            setIsRunning(false);
            setProgress(0);
            setCurrentMigration(null);
        }
    }, []);

    return {
        isRunning,
        progress,
        currentMigration,
        runMigration,
        getAllMigrations: () => migrationTracker.getAllMigrations()
    };
};

export default dataMigration; 