"use client";

import { ChangeEvent, useState, useCallback } from "react";

type UseCharacterLimitProps = {
  maxLength: number;
  initialValue?: string;
};

export function useCharacterLimit({ maxLength, initialValue = "" }: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
      setCharacterCount(newValue.length);
    }
  }, [maxLength]);

  const setLimitValue = useCallback((newValue: string) => {
    setValue(newValue);
    setCharacterCount(newValue.length);
  }, []);

  return {
    value,
    setValue: setLimitValue,
    characterCount,
    handleChange,
    maxLength,
  };
}

