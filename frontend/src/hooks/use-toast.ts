export const useToast = () => {
  const toast = ({ title, description }: any) => {
    alert(`${title}\n${description}`);
  };
  return { toast };
};
