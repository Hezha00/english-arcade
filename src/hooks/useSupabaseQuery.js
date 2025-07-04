// useSupabaseQuery.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useSupabaseQuery({ table, filters = [], single = false, select = '*' }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            let query = supabase.from(table).select(select)

            filters.forEach(({ column, operator = 'eq', value }) => {
                query = query[operator](column, value)
            })

            if (single) query = query.single()

            const { data, error } = await query
            setData(data)
            setError(error)
            setLoading(false)
        }

        fetch()
    }, [table, filters, single, select])

    return { data, loading, error }
}
