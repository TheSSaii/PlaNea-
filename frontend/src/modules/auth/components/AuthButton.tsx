import { Button } from '../../../shared/ui';

type AuthButtonProps = {
  text: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
};

export default function AuthButton({ text, type = 'button', onClick, disabled = false }: AuthButtonProps) {
  return (
    <Button type={type} onClick={onClick} disabled={disabled} variant="primary" size="lg" fullWidth>
      {text}
    </Button>
  );
}
