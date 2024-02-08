import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import * as React from 'react';

interface GraderLoadingButtonProps extends LoadingButtonProps{
    onClick: () => void | Promise<void>;
}

export function GraderLoadingButton({
    onClick,
    ...props 
  }: GraderLoadingButtonProps) {
    
    const [loading, setLoading] = React.useState(false);
  
    const handleClick = async () => {
      setLoading(true);
      const result = onClick();
      if (result instanceof Promise) {
          result.finally(() => setLoading(false));
      } else {
          setLoading(false);
      }
    };
  
    return (
      <LoadingButton
        loading={loading}
        onClick={handleClick}
        {...props} 
      >
      </LoadingButton>
    );
  }
