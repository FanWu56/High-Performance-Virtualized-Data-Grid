import React, {useState, memo} from "react"

type Align = "left" | "center"| "right"

type Column<T> = {
    key: string
    title: string
    width: number
    align?: Align
    sortable?: boolean
    render?: (value: unknown, record: T, rowIndex: number) => React.ReactNode
    dataIndex?: keyof T;       //which item need of a single data
}

type SortDirection = "asc" | "desc"

type SortState<T> ={
    key: keyof T | string
    direction: SortDirection
} | null

type VirtualizedDataTableProps<T> = {
    data: T[]
    columns: Column<T>[]
    rowKey: keyof T | ((record: T) => string | number)
    height?: number;
    rowHeight?: number;
    headerHeight?: number;
    overscan?: number;
    className?: string;
    emptyText?: string;
}

type Employee = {
  id: number;
  name: string;
  email: string;
  team: string;
  city: string;
  age: number;
  salary: number;
  performance: number;
};

const DEFAULT_HEIGHT = 520;
const DEFAULT_ROW_HEIGHT = 44;
const DEFAULT_HEADER_HEIGHT = 48;
const DEFAULT_OVERSCAN = 6;

function clamp(value: number, min: number, max:number){
    if (value < min){
        return min
    }
    if (value > max){
        return max
    }
    return value
}

function getRowKey<T>(rowKey: VirtualizedDataTableProps<T>["rowKey"], record: T){
    return typeof rowKey === "function" ? rowKey(record) : (record[rowKey] as React.Key)
}

function sortData<T extends Record<string, unknown>>(data: T[], sortState: SortState<T>){
    if (!sortState) return data;

    const {key, direction} = sortState;
    const factor = direction === "asc" ? 1 : -1;

    return [...data].sort((a, b) =>{
        const left = a[key as keyof T]
        const right = b[key as keyof T]

        if (left == null && right == null) return 0
        if (left == null) return -1 * factor
        if (right == null) return 1 * factor

        if (typeof left === "number" && typeof right === "number"){
            return (left - right) * factor
        }

        return String(left).localeCompare(String(right), "en",{
            numeric: true,
            sensitivity: "base"
        }) * factor
    })
}

function useVirtualWindow(params:{
    count: number;
    rowHeight: number;
    viewportHeight: number;
    overscan: number;
}) {
    const { count, rowHeight, viewportHeight, overscan } = params;
    const [scrollTop, setScrollTop] = useState(0);

    const totalHeight = count * rowHeight;
    const visibleCount = Math.ceil(viewportHeight / rowHeight);

    const startIndex = clamp(Math.floor(scrollTop / rowHeight) - overscan, 0, Math.max(count - 1, 0));
    const endIndex = clamp(startIndex + visibleCount + overscan * 2, 0, count);
    const offsetY = startIndex * rowHeight;       // First render visible row from here

    return {
    scrollTop,
    setScrollTop,
    totalHeight,
    startIndex,
    endIndex,
    offsetY,
    };
}

// Make arrow icon let user can easy distinguish the crrent sortring method(desc or asc)
const SortIcon = memo(function SortIcon({active, direction}:{active: boolean; direction?: SortDirection}){
    return (
        <span className="ml-1 inline-flex w-4 flex-col items-center justify-center text-[10px] leading-none text-slate-400">
        <span className={active && direction ==="asc" ? "text-slate- 900" : undefined}>▲</span>
        <span className={active && direction === "desc" ? "text-slate-900" : undefined}>▼</span>
    </span>
    )
})

//Define type of header cell
type HeaderCellProps<T> = {
    column: Column<T>
    sortState: SortState<T>
    onSort: (column: Column<T>) => void
}

const HeaderCell = memo(function HeaderCell<T extends Record<string, unknown>>({
    column,
    sortState,
    onSort,
    }: HeaderCellProps<T>){
        const isActive = sortState?.key === (column.dataIndex as string | undefined)
        const canSort = Boolean(column.sortable && column.dataIndex)

        return( 
            <div
                role="columnheader"
                className="flex h-full shrink-0 items-center border-b
                border-slate-200 bg-slate-50 px-4 text-sm font-semibold
                text-slate-700"
                style={{ width: column.width, justifyContent: justifyContent(column.align) }}
            >
                {
                    canSort? (
                        <button
                            type="button"
                            onClick={()=> onSort(column)}
                            className = "inline-flex items-center gap-1 transition hover:text-slate-900"

                        >
                            <span>{column.title}</span>
                            <SortIcon active={Boolean(isActive)} direction={sortState?.direction} />
                        </button>):(
                            <span>{column.title}</span>
                        )
                }
            </div>
        )
    }) as <T extends Record<string, unknown>>(props: HeaderCellProps<T>) => React.JSX.Element;

// add "as..." here because sometimes typescript cant work well with memo(something<T>), so manully assert it

function justifyContent(align: Align = "left") {
  if (align === "center") return "center";
  if (align === "right") return "flex-end";
  return "flex-start";
}

type RowProps<T> = {
  row: T;
  rowIndex: number;
  columns: Column<T>[];
  rowHeight: number;
};

const VirtualRow = memo(function VirtualRow<T extends Record<string, unknown>>({
    row,
    rowIndex,
    columns,
    rowHeight
    }: RowProps<T>){
        return (
            <div
                role="row"
                className="flex border-b border-slate-100 bg-white transition hover:bg-slate-50"
                style={{ height: rowHeight }}
            >
                {
                    columns.map((column)=>{
                        const rawValue = column.dataIndex? row[column.dataIndex] : undefined
                        const content = column.render? column.render(rawValue, row, rowIndex) : String(rawValue ?? "-");

                        return(
                            <div
                                key={column.key}
                                role="gridcell"
                                className="flex shrink-0 items-center px-4 text-sm text-slate-700"
                                style={{ width: column.width, justifyContent: justifyContent(column.align) }}
                            >
                                <div className="min-w-0 truncate">{content}</div>
                            </div>
                        )
                    }

                    )
                }
            </div>
        )
    }

)




