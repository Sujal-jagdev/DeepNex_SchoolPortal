import React, { createContext, useState } from 'react'
export const MyContext = createContext()

const AllContext = ({ children }) => {
    const [role, setrole] = useState('')
    return (
        <MyContext.Provider value={{ role, setrole }}>{children}</MyContext.Provider>
    )
}

export default AllContext