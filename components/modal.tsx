import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const Modal = ({ open, content, title, trigger, setOpen }: { open: boolean, content: ReactNode, title: string, trigger: string | ReactNode, setOpen: (open: boolean) => void }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
