import React, { createContext, useState } from 'react'


export const DataContext = createContext()

const UserContext = ({children}) => {

  const [user,setUser] = useState(null)
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [role,setRole] = useState('')


  return (
    
    <div>
      <DataContext.Provider value={{user,setUser,email,setEmail,password,setPassword,role,setRole}} >
          {children}
      </DataContext.Provider>
    </div>
  )
}

export default UserContext