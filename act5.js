class Stack {
  constructor(max_size) {
    this.max_size = max_size;
    this.ptr_position = -1;
    this.stack = [];
  }

  push(element) {
    if (this.ptr_position + 1 < this.max_size) {
      this.ptr_position += 1;
      this.stack.push(element);
      console.log(`Pushed ${element} onto the stack.`);
    } else {
      console.log(`Cannot push ${element} onto a full stack.`); // stack overflow
    }
  }

  pop() {
    if (this.ptr_position > -1) {
      const element = this.stack[this.ptr_position];
      this.stack.pop();
      this.ptr_position -= 1;
      console.log(`Popped ${element} from the stack.`);
      return element;
    } else {
      console.log(`Cannot pop from an empty stack.`); // stack underflow
      return null;
    }
  }

  display() {
    if (this.ptr_position > -1 && this.ptr_position < this.stack.length) {
      for (let i = this.ptr_position; i > -1; i--) {
        console.log(i, this.stack[i]);
      }
    }
  }
}

const stack = new Stack((max_size = 5));

stack.push("Gerald");
stack.display();

stack.pop();
stack.display();

stack.pop();

stack.push("Riandrei Kenneth E. Casañas"); // Your name
stack.push("BSCS-3A"); // Your program-block
stack.push("202110056"); // Your student number
stack.push("17-04/24"); // Your date
stack.push("75"); // 75
stack.display();

stack.push("90"); // Your expected grade

stack.pop();

stack.push("60"); // actual grade :D | D:
stack.display();
