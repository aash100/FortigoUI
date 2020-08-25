/*
 * Created on Fri Sep 27 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, Input, EventEmitter, Output, SimpleChanges, OnChanges, OnInit } from '@angular/core';

import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { FortigoTreeNode } from '../../models/FortigoTreeNode';
import { EditImageData } from '../../models/edit-image-data.model';

/** Flat node with expandable and level information */
export class DynamicFlatNode {
  constructor(public item: FortigoTreeNode, public level = 1, public expandable = false,
    public isLoading = false) { }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {

  dataMap: Array<FortigoTreeNode>;
  /** Initial data from database */
  initialData(): DynamicFlatNode[] {
    if (this.dataMap) {
      return this.dataMap.map(name => new DynamicFlatNode(name, 0, true));
    }
  }

  getChildren(node: FortigoTreeNode): Array<FortigoTreeNode> | undefined {
    // return this.dataMap.get(node);
    let childNodes: Array<FortigoTreeNode>;
    this.dataMap.forEach((data) => {
      if (data.key === node.key) {
        childNodes = data.node;
      }
    });
    return childNodes;
  }

  isExpandable(node: FortigoTreeNode): boolean {
    return node.node ? true : false;
  }
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] { return this.dataChange.value; }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase) { }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.onChange.subscribe(change => {
      if ((change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    const children = this._database.getChildren(node.item);
    const index = this.data.indexOf(node);
    if (!children || index < 0) { // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

    setTimeout(() => {
      if (expand) {
        const nodes = children.map(name =>
          new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)));
        this.data.splice(index + 1, 0, ...nodes);
      } else {
        let count = 0;
        for (let i = index + 1; i < this.data.length
          && this.data[i].level > node.level; i++ , count++) { }
        this.data.splice(index + 1, count);
      }

      // notify the change
      this.dataChange.next(this.data);
      node.isLoading = false;
    }, 1000);
  }
}

@Component({
  selector: 'app-fortigo-doc-viewer',
  templateUrl: './fortigo-doc-viewer.component.html',
  styleUrls: ['./fortigo-doc-viewer.component.css'],
  providers: [DynamicDatabase]
})
export class FortigoDocViewerComponent implements OnChanges, OnInit {
  // Input Doc Fields.
  @Input() imageFields: Array<any>;
  // Document Data
  @Input() docData: Array<FortigoTreeNode>;
  // Upload Field Input.
  @Input() uploadFields: Array<any>;
  // To emit event on click of any item.
  @Output() itemClick = new EventEmitter();
  // Emit image changes on save action.
  @Output() saveImageChanges = new EventEmitter<EditImageData>();

  public showImage = false;
  public showImageUrl: string;
  public fieldsFontSize = FortigoConstant.FONT_SMALL;
  public hasContent: boolean;
  public cropSelected = false;

  private imageData: EditImageData;
  private relativePathImage: string;
  @Output() uploadDocumentChanges = new EventEmitter();
  public currentNode: FortigoTreeNode;
  public isLoading: boolean;
  public previewTitle = 'Please select a file to Preview.';
  public fileType = 'image';

  constructor(private database: DynamicDatabase) { }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.docData) {
      this.docData = changes.docData.currentValue;
      this.database.dataMap = this.docData;
      this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
      this.dataSource = new DynamicDataSource(this.treeControl, this.database);
      this.dataSource.data = this.database.initialData();
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
  }

  /**
   * To do operations on click of any child item
   * @param  {FortigoTreeNode} item: Node Item
   */
  public onChildNodeClick(item: FortigoTreeNode) {
    this.currentNode = item;
    this.hasContent = true;
    this.showImage = true;
    this.relativePathImage = item.value.nodePathValue;
    if (item.value.nodePathValue.includes('pdf')) {
      this.fileType = 'pdf';
      this.showImageUrl = 'assets/images/pdf.png';
    } else {
      this.showImageUrl = 'https://www.4tigo.com/app/file.php?gbl=1&url=document-upload/' + item.value.nodePathValue;
    }
  }

  /**
   * To do operations on click of any root item.
   * @param  {FortigoTreeNode} item: Node item
   */
  public onRootNodeClick(item: FortigoTreeNode) {
    this.currentNode = item;
    this.showImage = false;
    if (!item.node || item.node.length === 0) {
      this.previewTitle = 'No File to preview';
    }
    this.hasContent = false;
  }

  /**
   * For Edit purpose of image.
   */
  public editImage() {
    this.cropSelected = true;
  }

  /**
   * To Undo the edit changes.
   */
  public undoEditChanges() {
    this.cropSelected = false;
  }

  /**
   * For Detecting image changes done by user.
   * @param  {EditImageData} $event : Image change event
   */
  public updateImage($event: EditImageData) {
    this.imageData = $event;
  }

  /**
   * For save image operation.
   */
  public saveImage() {
    this.imageData.path = this.relativePathImage;
    this.saveImageChanges.emit(this.imageData);
  }

  /**
   * To upload document.
   * @param  {any} $event
   */
  public uploadDocument($event: any) {
    this.uploadDocumentChanges.emit({ docData: this.currentNode, file: $event });
  }
}
