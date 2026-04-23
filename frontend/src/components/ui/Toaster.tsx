import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'bg-white border border-gray-200 shadow-lg rounded-xl p-4 w-full flex gap-3 items-start',
          title: 'text-[15px] font-bold leading-tight',
          description: 'text-[14px] font-medium leading-snug',
          success:
            '!border-primary-500 [&_[data-title]]:text-primary-600 [&_[data-description]]:text-primary-500 [&_svg]:text-primary-600',
          error:
            '!border-red-500 [&_[data-title]]:text-red-600 [&_[data-description]]:text-red-500 [&_svg]:text-red-600',
          warning:
            '!border-yellow-500 [&_[data-title]]:text-yellow-600 [&_[data-description]]:text-yellow-500 [&_svg]:text-yellow-600',
          info: '!border-blue-500 [&_[data-title]]:text-blue-600 [&_[data-description]]:text-blue-500 [&_svg]:text-blue-600',
          icon: 'mt-0.5',
        },
      }}
      expand={false}
      duration={5000}
    />
  );
}
