import { createContext, useContext, useState } from 'react';
interface ContextValue {
  toggleDrawer: (event: boolean, id: string) => void
  open: boolean
  jobId: string
}
const DrawerContext = createContext<ContextValue>({
  toggleDrawer: () => { },
  open: false,
  jobId: ''
})

const CustomDrawer = ({ children }: { children: any }) => {
  const [open, setOpen] = useState(false)
  const [jobId, setJobId] = useState('')

  const toggleDrawer = (newOpen: boolean, id: string) => {
    setOpen(newOpen);
    setJobId(id)
  };

  return (
    <DrawerContext.Provider value={{ toggleDrawer, open, jobId }}>
      {children}
    </DrawerContext.Provider>
  )
}

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a CustomDrawer');
  }
  return context;
}
export default CustomDrawer