import * as React from "react";
import { cn } from "../../utils/cn";

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
}>({
    value: "",
    onValueChange: () => {},
});

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ defaultValue, children, className, ...props }, ref) => {
        const [value, setValue] = React.useState(defaultValue);

        return (
            <TabsContext.Provider value={{ value, onValueChange: setValue }}>
                <div
                    ref={ref}
                    id="tabs"
                    data-current-tab={value}
                    className={cn("w-full", className)}
                    {...props}
                >
                    {children}
                </div>
            </TabsContext.Provider>
        );
    },
);
Tabs.displayName = "Tabs";

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
    ({ children, className, ...props }, ref) => {
        const { value, onValueChange } = React.useContext(TabsContext);

        // Extract options from TabsTrigger children
        const options = React.useMemo(() => {
            const opts: Array<{ value: string; label: string }> = [];
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) && child.type === TabsTrigger) {
                    const triggerProps = child.props as TabsTriggerProps;
                    opts.push({
                        value: triggerProps.value,
                        label: triggerProps.label,
                    });
                }
            });
            return opts;
        }, [children]);

        return (
            <>
                {/* Mobile Select */}
                <div className="block md:hidden relative">
                    <select
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        className={cn(
                            "w-full px-3 py-2 pr-8 text-sm bg-white border border-gray-300 rounded-md shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent",
                            "appearance-none cursor-pointer",
                            className,
                        )}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Desktop Tabs */}
                <div
                    ref={ref}
                    className={cn(
                        // Hidden on mobile, visible on desktop
                        "hidden md:flex items-center justify-center rounded-md bg-gray-100 text-gray-500",
                        "h-10 p-1",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </>
        );
    },
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps {
    value: string;
    label: string;
    children: React.ReactNode;
    className?: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ value, children, className, ...props }, ref) => {
        const { value: selectedValue, onValueChange } = React.useContext(
            TabsContext,
        );
        const isSelected = selectedValue === value;

        return (
            <button
                ref={ref}
                className={cn(
                    // Base styles
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    // Desktop only - hidden on mobile since we use select
                    "px-3 py-1.5 text-sm",
                    // Active/inactive states
                    isSelected
                        ? "bg-white text-gray-950 shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-200 cursor-pointer",
                    className,
                )}
                onClick={() => onValueChange(value)}
                {...props}
            >
                {children}
            </button>
        );
    },
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ value, children, className, ...props }, ref) => {
        const { value: selectedValue } = React.useContext(TabsContext);

        if (selectedValue !== value) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
