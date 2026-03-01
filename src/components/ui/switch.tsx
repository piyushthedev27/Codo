'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(checked || false)

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked)
            }
        }, [checked])

        const handleToggle = () => {
            const newValue = !isChecked
            setIsChecked(newValue)
            if (onCheckedChange) {
                onCheckedChange(newValue)
            }
        }

        return (
            <div
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
                    className
                )}
                onClick={handleToggle}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    ref={ref}
                    checked={isChecked}
                    onChange={() => { }} // Controlled by parent div click
                    {...props}
                />
                <motion.span
                    className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform"
                    initial={false}
                    animate={{
                        x: isChecked ? 22 : 2,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                />
            </div>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
