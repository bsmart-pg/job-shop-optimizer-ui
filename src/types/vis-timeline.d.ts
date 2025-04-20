declare module 'vis-timeline' {
  import { DataSet, DataView } from 'vis-data';

  export class Timeline {
    constructor(
      container: HTMLElement,
      items: DataSet<any> | any[],
      groups: DataSet<any> | any[],
      options?: TimelineOptions
    );
    
    setItems(items: DataSet<any> | any[]): void;
    setGroups(groups: DataSet<any> | any[]): void;
    setOptions(options: TimelineOptions): void;
    setWindow(start: Date | string | number, end: Date | string | number, options?: any): void;
    redraw(): void;
    fit(options?: any): void;
    destroy(): void;
    
    on(event: string, callback: (properties: any) => void): void;
    off(event: string, callback: (properties: any) => void): void;
  }

  export interface TimelineOptions {
    width?: string | number;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    autoResize?: boolean;
    start?: Date | number | string;
    end?: Date | number | string;
    moment?: (date: Date | string) => any;
    locale?: string;
    zoomable?: boolean;
    moveable?: boolean;
    selectable?: boolean;
    multiselect?: boolean;
    multiselectPerGroup?: boolean;
    zoomKey?: string;
    zoomMin?: number;
    zoomMax?: number;
    stack?: boolean;
    margin?: any;
    template?: any;
    visibleFrameTemplate?: any;
    groupTemplate?: any;
    showTooltips?: boolean;
    tooltip?: any;
    tooltipOnItemUpdateTime?: any;
    clickToUse?: boolean;
    onAdd?: any;
    onUpdate?: any;
    onRemove?: any;
    onMove?: any;
    onMoving?: any;
    onAddGroup?: any;
    onMoveGroup?: any;
    onRemoveGroup?: any;
    order?: any;
    groupOrder?: any;
    orientation?: { axis?: string; item?: string };
    groupEditable?: boolean | { add?: boolean; remove?: boolean; order?: boolean };
    editable?: boolean | { add?: boolean; remove?: boolean; updateGroup?: boolean; updateTime?: boolean; overrideItems?: boolean };
    snap?: any;
    timeAxis?: { scale?: string; step?: number };
    xss?: { disabled?: boolean };
    format?: any;
    minorLabels?: any;
    majorLabels?: any;
  }

  export interface DataItem {
    id: string | number;
    content: string;
    start: Date | string | number;
    end?: Date | string | number;
    type?: string;
    group?: string | number;
    className?: string;
    style?: string;
    subgroup?: string | number;
    editable?: boolean;
    title?: string;
  }
}

declare module 'vis-timeline/styles/vis-timeline-graph2d.css' {
  const content: any;
  export default content;
}
