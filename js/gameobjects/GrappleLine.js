import Component from '../base/component.js';

class GrappleLine extends Component {
  constructor(startPosition, endPosition) {
    super();
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.color = '#DBB500';
    this.lineWidth = 6; 
  }

  draw(ctx) {
    // Draw a line from the start position to the end position
    ctx.beginPath();
    ctx.moveTo(this.startPosition.x, this.startPosition.y);
    ctx.lineTo(this.endPosition.x, this.endPosition.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
  }
}

export default GrappleLine;