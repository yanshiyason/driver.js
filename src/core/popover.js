import Element from './element';
import {
  CLASS_BTN_DISABLED,
  CLASS_CLOSE_BTN,
  CLASS_NEXT_STEP_BTN,
  CLASS_POPOVER_DESCRIPTION,
  CLASS_POPOVER_FOOTER,
  CLASS_POPOVER_TIP,
  CLASS_POPOVER_TITLE,
  CLASS_PREV_STEP_BTN,
  ID_POPOVER,
  POPOVER_HTML,
} from '../common/constants';
import { createNodeFromString } from '../common/utils';

/**
 * Popover that is displayed on top of the highlighted element
 */
export default class Popover extends Element {
  /**
   * @param {Object} options
   * @param {Window} window
   * @param {Document} document
   */
  constructor(options, window, document) {
    super();

    this.options = {
      isFirst: true,
      isLast: true,
      totalCount: 1,
      currentIndex: 0,
      showButtons: true,
      closeBtnText: 'Close',
      doneBtnText: 'Done',
      startBtnText: 'Next &rarr;',
      nextBtnText: 'Next &rarr;',
      prevBtnText: '&larr; Previous',
      ...options,
    };

    this.window = window;
    this.document = document;

    this.makeNode();
    this.hide();
  }

  /**
   * Prepares the dom element for popover
   * @private
   */
  makeNode() {
    let popover = this.document.getElementById(ID_POPOVER);
    if (!popover) {
      popover = createNodeFromString(POPOVER_HTML);
      document.body.appendChild(popover);
    }

    this.node = popover;
    this.tipNode = popover.querySelector(`.${CLASS_POPOVER_TIP}`);
    this.titleNode = popover.querySelector(`.${CLASS_POPOVER_TITLE}`);
    this.descriptionNode = popover.querySelector(`.${CLASS_POPOVER_DESCRIPTION}`);
    this.footerNode = popover.querySelector(`.${CLASS_POPOVER_FOOTER}`);
    this.nextBtnNode = popover.querySelector(`.${CLASS_NEXT_STEP_BTN}`);
    this.prevBtnNode = popover.querySelector(`.${CLASS_PREV_STEP_BTN}`);
    this.closeBtnNode = popover.querySelector(`.${CLASS_CLOSE_BTN}`);
  }

  /**
   * Gets the title node for the popover
   * @returns {Element | null | *}
   * @public
   */
  getTitleNode() {
    return this.titleNode;
  }

  /**
   * Gets the description node for the popover
   * @returns {Element | null | *}
   * @public
   */
  getDescriptionNode() {
    return this.descriptionNode;
  }

  /**
   * Gets popover top position
   * @returns {Number}
   * @public
   */
  getTop(elementPosition) {
    const popoverHeight = this.getSize().height;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    return elementPosition.top - popoverHeight - popoverMargin;
  }
  /**
   * Gets popover bottom position
   * @returns {Number}
   * @public
   */
  getBottom(elementPosition) {
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    return elementPosition.bottom + popoverMargin;
  }
  /**
   * Gets popover left position
   * @returns {Number}
   * @public
   */
  getLeft(elementPosition) {
    const popoverWidth = this.getSize().width;
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    return elementPosition.left - popoverWidth - popoverMargin;
  }
  /**
   * Gets popover horizontal right position
   * @returns {Number}
   * @public
   */
  getRight(elementPosition) {
    const popoverMargin = this.options.padding + 10; // adding 10 to give it a little distance from the element
    return elementPosition.right + popoverMargin;
  }
  /**
   * Gets popover horizontal center position
   * @returns {Number}
   * @public
   */
  getXCenter(elementPosition) {
    return elementPosition.left - this.options.padding;
  }
  /**
   * Gets popover vertical center position
   * @returns {Number}
   * @public
   */
  getYCenter(elementPosition) {
    return elementPosition.top - this.options.padding;
  }

  /**
   * Hides the popover
   * @public
   */
  hide() {
    this.node.style.display = 'none';
  }

  /**
   * Sets the default state for the popover
   * @private
   */
  setInitialState() {
    this.node.style.display = 'block';
    this.node.style.left = '0';
    this.node.style.top = '0';
    this.node.style.bottom = '';
    this.node.style.right = '';

    // Remove the positional classes from tip
    this.node
      .querySelector(`.${CLASS_POPOVER_TIP}`)
      .className = CLASS_POPOVER_TIP;
  }

  /**
   * Shows the popover at the given position
   * @param {Position} position
   * @public
   */
  show(position) {
    this.setInitialState();

    // Set the title and descriptions
    this.titleNode.innerHTML = this.options.title;
    this.descriptionNode.innerHTML = this.options.description;

    this.renderButtons();

    // Position the popover around the given position
    switch (this.options.position) {
      case 'left':
        this.positionOnLeft(position);
        break;
      case 'right':
        this.positionOnRight(position);
        break;
      case 'top':
        this.positionOnTop(position);
        break;
      case 'bottom':
        this.positionOnBottom(position);
        break;
      case 'corner':
        this.autoPositionCorner(position);
        break;
      case 'auto':
      default:
        this.autoPosition(position);
        break;
    }
  }

  /**
   * Enables, disables buttons, sets the text and
   * decides if to show them or not
   * @private
   */
  renderButtons() {
    this.nextBtnNode.innerHTML = this.options.nextBtnText;
    this.prevBtnNode.innerHTML = this.options.prevBtnText;
    this.closeBtnNode.innerHTML = this.options.closeBtnText;

    // If there was only one item, hide the buttons
    if (!this.options.showButtons || !this.options.totalCount || this.options.totalCount === 1) {
      this.footerNode.style.display = 'none';
      return;
    }

    this.footerNode.style.display = 'block';
    if (this.options.isFirst) {
      this.prevBtnNode.classList.add(CLASS_BTN_DISABLED);
      this.nextBtnNode.innerHTML = this.options.startBtnText;
    } else {
      this.prevBtnNode.classList.remove(CLASS_BTN_DISABLED);
    }

    if (this.options.isLast) {
      this.nextBtnNode.innerHTML = this.options.doneBtnText;
    } else {
      this.nextBtnNode.innerHTML = this.options.nextBtnText;
    }
  }

  /**
   * Shows the popover on the left of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionOnLeft(elementPosition) {
    this.node.style.left = `${this.getLeft(elementPosition)}px`;
    this.node.style.top = `${this.getYCenter(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('right');
  }

  /**
   * Shows the popover on the right of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionOnRight(elementPosition) {
    this.node.style.left = `${this.getRight(elementPosition)}px`;
    this.node.style.top = `${this.getYCenter(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('left');
  }

  /**
   * Shows the popover on the top of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionOnTop(elementPosition) {
    this.node.style.top = `${this.getTop(elementPosition)}px`;
    this.node.style.left = `${this.getXCenter(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('bottom');
  }

  /**
   * Shows the popover on the bottom of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionOnBottom(elementPosition) {
    this.node.style.top = `${this.getBottom(elementPosition)}px`;
    this.node.style.left = `${this.getXCenter(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('top');
  }

  /**
   * Shows the popover top left of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionTopLeft(elementPosition) {
    this.node.style.top = `${this.getTop(elementPosition)}px`;
    this.node.style.left = `${this.getLeft(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('top-left');
  }
  /**
   * Shows the popover top right of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionTopRight(elementPosition) {
    this.node.style.left = `${this.getRight(elementPosition)}px`;
    this.node.style.top = `${this.getTop(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('top-right');
  }
  /**
   * Shows the popover bottom left of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionBottomLeft(elementPosition) {
    this.node.style.top = `${this.getBottom(elementPosition)}px`;
    this.node.style.left = `${this.getLeft(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('bottom-left');
  }
  /**
   * Shows the popover bottom right of the given position
   * @param {Position} elementPosition
   * @private
   */
  positionBottomRight(elementPosition) {
    this.node.style.top = `${this.getBottom(elementPosition)}px`;
    this.node.style.left = `${this.getRight(elementPosition)}px`;
    this.node.style.right = '';
    this.node.style.bottom = '';

    this.tipNode.classList.add('bottom-right');
  }

  /**
   * Automatically positions the popover for elements in page corner
   * such that the element and popover remain in view
   * @param {Position} elementPosition
   * @private
   */
  autoPositionCorner(elementPosition) {
    const yScreenCenter = document.body.clientHeight / 2;
    const xScreenCenter = document.body.clientWidth / 2;

    let top = false;
    let bottom = false;
    let right = false;
    let left = false;

    if (elementPosition.yCenter() > yScreenCenter) {
      top = true;
    } else {
      bottom = true;
    }

    if (elementPosition.xCenter() > xScreenCenter) {
      left = true;
    } else {
      right = true;
    }

    if (top && left) {
      this.positionTopLeft(elementPosition);
    }

    if (top && right) {
      this.positionTopRight(elementPosition);
    }

    if (bottom && left) {
      this.positionBottomLeft(elementPosition);
    }

    if (bottom && right) {
      this.positionBottomRight(elementPosition);
    }
  }

  /**
   * Automatically positions the popover around the given position
   * such that the element and popover remain in view
   * @todo add the left and right positioning decisions
   * @param {Position} elementPosition
   * @private
   */
  autoPosition(elementPosition) {
    const pageSize = this.getFullPageSize();
    const popoverSize = this.getSize();

    const pageHeight = pageSize.height;
    const popoverHeight = popoverSize.height;
    const popoverMargin = this.options.padding + 10;  // adding 10 to give it a little distance from the element

    const pageHeightAfterPopOver = elementPosition.bottom + popoverHeight + popoverMargin;

    // If adding popover would go out of the window height, then show it to the top
    if (pageHeightAfterPopOver >= pageHeight) {
      this.positionOnTop(elementPosition);
    } else {
      this.positionOnBottom(elementPosition);
    }
  }
}
