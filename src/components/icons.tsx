import React from 'react';
import {
  MdAutorenew,

} from 'react-icons/md';

// Direct re-exports keep bundle lean & types intact
export { MdPower as PlugIcon } from 'react-icons/md';
export { MdSend as SendIcon } from 'react-icons/md';
export { MdAdd as PlusIcon } from 'react-icons/md';
export { MdDelete as TrashIcon } from 'react-icons/md';
export { MdClose as XIcon } from 'react-icons/md';
export { MdWarning as AlertTriangleIcon } from 'react-icons/md';
export { MdCheck as CheckIcon } from 'react-icons/md';
export { MdWbSunny as SunIcon } from 'react-icons/md';
export { MdNightlightRound as MoonIcon } from 'react-icons/md';
export { MdContentCopy as ClipboardIcon } from 'react-icons/md';

// Spinner needs animation class; keep a tiny wrapper
export const LoadingSpinnerIcon: React.FC<React.ComponentProps<typeof MdAutorenew>> = (props) => {
  const { className, ...rest } = props as any; // className typing quirk workaround
  return <MdAutorenew {...rest} className={['animate-spin', className].filter(Boolean).join(' ')} />;
};