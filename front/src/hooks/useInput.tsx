import { useState } from "react";
import { useUser } from '../core/contexts/userContext'

type InputHook = {
  value: string;
  setValue: (s: string) => void;
  reset: () => void;
  bind: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
};
/**
 * @function useInput
 * @description check if all args are null
 *
 * @param {string} initialValue - default input value
 * @return {boolean}
 *
 * @example
 * const {value: name, setValue} useInput("majdi")
 *
 */
export default function useInput(initialValue: string = ""): InputHook {
  const [value, setValue] = useState<string>(initialValue);
  const [user, dispatch] = useUser()

  const change = (nickname: string): void => {
    dispatch({ type: 'UPDATE_USERNAME', payload: { nickname } })
  }

  return {
    value,
    setValue,
    reset: (): void => setValue(""),
    bind: {
      value,
      onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setValue(event.target.value);
        change(event.target.value);
      },
    },
  };
}
