/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var events_1 = require("../events");
var headerRowComp_1 = require("./headerRowComp");
var bodyDropTarget_1 = require("./bodyDropTarget");
var constants_1 = require("../constants/constants");
var dom_1 = require("../utils/dom");
var beanStub_1 = require("../context/beanStub");
var utils_1 = require("../utils");
var HeaderContainer = /** @class */ (function (_super) {
    __extends(HeaderContainer, _super);
    function HeaderContainer(eContainer, eViewport, pinned) {
        var _this = _super.call(this) || this;
        _this.groupsRowComps = [];
        _this.eContainer = eContainer;
        _this.pinned = pinned;
        _this.eViewport = eViewport;
        return _this;
    }
    HeaderContainer.prototype.forEachHeaderElement = function (callback) {
        if (this.groupsRowComps) {
            this.groupsRowComps.forEach(function (c) { return c.forEachHeaderElement(callback); });
        }
        if (this.columnsRowComp) {
            this.columnsRowComp.forEachHeaderElement(callback);
        }
        if (this.filtersRowComp) {
            this.columnsRowComp.forEachHeaderElement(callback);
        }
    };
    HeaderContainer.prototype.init = function () {
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.addManagedListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
    };
    HeaderContainer.prototype.onColumnResized = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onDisplayedColumnsChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onScrollVisibilityChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.onScrollbarWidthChanged = function () {
        this.setWidthOfPinnedContainer();
    };
    HeaderContainer.prototype.setWidthOfPinnedContainer = function () {
        var pinningLeft = this.pinned === constants_1.Constants.PINNED_LEFT;
        var pinningRight = this.pinned === constants_1.Constants.PINNED_RIGHT;
        var controller = this.columnController;
        var isRtl = this.gridOptionsWrapper.isEnableRtl();
        var scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        if (pinningLeft || pinningRight) {
            // size to fit all columns
            var width = controller[pinningLeft ? 'getPinnedLeftContainerWidth' : 'getPinnedRightContainerWidth']();
            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            var addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            if (addPaddingForScrollbar) {
                width += scrollbarWidth;
            }
            dom_1.setFixedWidth(this.eContainer, width);
        }
    };
    HeaderContainer.prototype.getRowComps = function () {
        var res = [];
        if (this.groupsRowComps) {
            res = res.concat(this.groupsRowComps);
        }
        if (this.columnsRowComp) {
            res.push(this.columnsRowComp);
        }
        if (this.filtersRowComp) {
            res.push(this.filtersRowComp);
        }
        return res;
    };
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    HeaderContainer.prototype.onGridColumnsChanged = function () {
        this.refresh(true);
    };
    // we expose this for gridOptions.api.refreshHeader() to call
    HeaderContainer.prototype.refresh = function (keepColumns) {
        if (keepColumns === void 0) { keepColumns = false; }
        this.refreshRowComps(keepColumns);
    };
    HeaderContainer.prototype.setupDragAndDrop = function (gridComp) {
        // center section has viewport, but pinned sections do not
        var dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        var bodyDropTarget = new bodyDropTarget_1.BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
        bodyDropTarget.registerGridComp(gridComp);
    };
    HeaderContainer.prototype.destroyRowComps = function (keepColumns) {
        if (keepColumns === void 0) { keepColumns = false; }
        this.groupsRowComps.forEach(this.destroyRowComp.bind(this));
        this.groupsRowComps = [];
        this.destroyRowComp(this.filtersRowComp);
        this.filtersRowComp = undefined;
        if (!keepColumns) {
            this.destroyRowComp(this.columnsRowComp);
            this.columnsRowComp = undefined;
        }
    };
    HeaderContainer.prototype.destroyRowComp = function (rowComp) {
        if (rowComp) {
            this.destroyBean(rowComp);
            this.eContainer.removeChild(rowComp.getGui());
        }
    };
    HeaderContainer.prototype.refreshRowComps = function (keepColumns) {
        var _this = this;
        if (keepColumns === void 0) { keepColumns = false; }
        var sequence = new utils_1.NumberSequence();
        var refreshColumnGroups = function () {
            var groupRowCount = _this.columnController.getHeaderRowCount() - 1;
            _this.groupsRowComps.forEach(_this.destroyRowComp.bind(_this));
            _this.groupsRowComps = [];
            for (var i = 0; i < groupRowCount; i++) {
                var rowComp = _this.createBean(new headerRowComp_1.HeaderRowComp(sequence.next(), headerRowComp_1.HeaderRowType.COLUMN_GROUP, _this.pinned));
                _this.groupsRowComps.push(rowComp);
            }
        };
        var refreshColumns = function () {
            var rowIndex = sequence.next();
            if (_this.columnsRowComp) {
                var rowIndexMismatch = _this.columnsRowComp.getRowIndex() !== rowIndex;
                if (!keepColumns || rowIndexMismatch) {
                    _this.destroyRowComp(_this.columnsRowComp);
                    _this.columnsRowComp = undefined;
                }
            }
            if (!_this.columnsRowComp) {
                _this.columnsRowComp = _this.createBean(new headerRowComp_1.HeaderRowComp(rowIndex, headerRowComp_1.HeaderRowType.COLUMN, _this.pinned));
            }
        };
        var refreshFilters = function () {
            _this.destroyRowComp(_this.filtersRowComp);
            _this.filtersRowComp = undefined;
            var includeFloatingFilter = !_this.columnController.isPivotMode() && _this.columnController.hasFloatingFilters();
            if (includeFloatingFilter) {
                _this.filtersRowComp = _this.createBean(new headerRowComp_1.HeaderRowComp(sequence.next(), headerRowComp_1.HeaderRowType.FLOATING_FILTER, _this.pinned));
            }
        };
        refreshColumnGroups();
        refreshColumns();
        refreshFilters();
        // this re-adds the this.columnsRowComp, which is fine, it just means the DOM will rearrange then,
        // taking it out of the last position and re-inserting relative to the other rows.
        this.getRowComps().forEach(function (rowComp) { return _this.eContainer.appendChild(rowComp.getGui()); });
    };
    __decorate([
        context_1.Autowired('columnController')
    ], HeaderContainer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService')
    ], HeaderContainer.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderContainer.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], HeaderContainer.prototype, "destroyRowComps", null);
    return HeaderContainer;
}(beanStub_1.BeanStub));
exports.HeaderContainer = HeaderContainer;

//# sourceMappingURL=headerContainer.js.map
