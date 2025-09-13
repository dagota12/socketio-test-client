import React from 'react';
import {
  MdPower,
  MdSend,
  MdAdd,
  MdDelete,
  MdClose,
  MdAutorenew,
  MdWarning,
  MdCheck,
  MdWbSunny,
  MdNightlightRound,
  MdContentCopy
} from 'react-icons/md';
import { IconBaseProps } from 'react-icons';

export const PlugIcon = (props: IconBaseProps) => <MdPower {...props} />;

export const SendIcon = (props: IconBaseProps) => <MdSend {...props} />;

export const PlusIcon = (props: IconBaseProps) => <MdAdd {...props} />;

export const TrashIcon = (props: IconBaseProps) => <MdDelete {...props} />;

export const XIcon = (props: IconBaseProps) => <MdClose {...props} />;

export const LoadingSpinnerIcon = (props: IconBaseProps) => (
  <MdAutorenew {...(props as any)} className={`animate-spin ${'className' in props ? (props as any).className : ''}`} />
);

export const AlertTriangleIcon = (props: IconBaseProps) => <MdWarning {...props} />;

export const CheckIcon = (props: IconBaseProps) => <MdCheck {...props} />;

export const SunIcon = (props: IconBaseProps) => <MdWbSunny {...props} />;

export const MoonIcon = (props: IconBaseProps) => <MdNightlightRound {...props} />;

export const ClipboardIcon = (props: IconBaseProps) => <MdContentCopy {...props} />;