import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  onClose: () => void;
  className?: string;
  label: string;
  children: (close: () => void) => ReactNode;
}

/** Fenêtre modale accessible (Échap, clic à l'extérieur, focus géré par le navigateur). */
export function Modal({ onClose, className = 'modal', label, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
    >
      {children(close)}
    </dialog>
  );
}
