// Type definitions for @ag-grid-community/core v25.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../../../widgets/component';
import { IDateComp, IDateParams } from '../../../rendering/dateComponent';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export declare class DefaultDateComponent extends Component implements IDateComp {
    private readonly eDateInput;
    constructor();
    destroy(): void;
    init(params: IDateParams): void;
    getDate(): Date;
    setDate(date: Date): void;
    setInputPlaceholder(placeholder: string): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    private shouldUseBrowserDatePicker;
}
