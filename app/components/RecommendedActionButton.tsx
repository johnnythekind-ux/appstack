"use client";

import { useState } from "react";
import Button from "./Button";

type RecommendedActionButtonProps = {
  label: string;
  onClick: () => void | Promise<void>;
};

export function RecommendedActionButton({
  label,
  onClick,
}: RecommendedActionButtonProps) {
  const [isWorking, setIsWorking] = useState(false);

  async function handleClick() {
    if (isWorking) return;

    setIsWorking(true);

    try {
      await onClick();
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <Button
      className="mt-6"
      onClick={handleClick}
      disabled={isWorking}
    >
      {isWorking ? "Working..." : label}
    </Button>
  );
}