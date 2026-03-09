import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#FFFFFF',
          border: '1px solid #E4E4E7',
          color: '#18181B',
        },
        className: 'toast',
        duration: 4000,
      }}
      {...props} 
    />
  );
}

export { Toaster, toast }
