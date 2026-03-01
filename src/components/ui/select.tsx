'use client'

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ children, defaultValue, onValueChange }: any) => {
    const [value, setValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    return (
        <div className="relative w-full">
            {React.Children.map(children, child => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, {
                        onClick: () => setOpen(!open),
                        value: value
                    })
                }
                if (child.type === SelectContent && open) {
                    return React.cloneElement(child, {
                        onSelect: (val: string) => {
                            setValue(val)
                            setOpen(false)
                            if (onValueChange) onValueChange(val)
                        },
                        selectedValue: value,
                        close: () => setOpen(false)
                    })
                }
                return null
            })}
        </div>
    )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
    ({ className, children, value, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value, children }: any) => {
    return <span>{value || placeholder}</span>
}

const SelectContent = ({ children, onSelect, selectedValue, close }: any) => {
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.relative')) {
                close()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [close])

    return (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div className="p-1">
                {React.Children.map(children, child => {
                    return React.cloneElement(child, {
                        onSelect,
                        isSelected: child.props.value === selectedValue
                    })
                })}
            </div>
        </div>
    )
}

const SelectItem = React.forwardRef<HTMLDivElement, any>(
    ({ className, children, value, onSelect, isSelected, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                isSelected && "bg-accent text-accent-foreground",
                className
            )}
            onClick={() => onSelect(value)}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
)
SelectItem.displayName = "SelectItem"

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
}
