const canvas = document.querySelector('canvas');
let body = document.querySelector('body');
canvas.height = window.innerHeight / 1.5;
canvas.width = window.innerWidth/ 1.05;
const ctx = canvas.getContext('2d');

// window resizing
window.addEventListener('resize', () => {
    if (!sorting) {
        Resize();
    }
})

function Resize() {
    canvas.height = window.innerHeight / 1.5;
    canvas.width = window.innerWidth / 1.05;
    arrayMembers = array.map((v, i) => {
        return new ArrayMember(i * (canvas.width / array_size - 1) + i, 0, canvas.width / array_size - 1 , v * 1, color=`${array_color}`);
    })
    drawAll();
}


let array_size = 60;
let speed = 5;
let ticks = 0;

let sorting = false; // to prevent multiple clicks of sort
let array_color = 'gray'; // for resizing purposes
let new_array = true; // to ensure there is a new array before sorting

const ACTIONS = {
    SORT: "SORT",
    COMPARE: "COMPARE",
    SWAP: "SWAP",
    MERGE: "MERGE",
    SELECT: "SELECT"
}



// random array
function RandomArray(array_size) {
    let array = [];
    for (let i = 0; i < array_size; i++) {
        let num = Math.floor(Math.random() * 400 + 5);
        array.push(num);
    }
    return array;
}

// for each array member
function ArrayMember(x, y, width, height, color = 'gray') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.draw = () => {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    this.resetColor = () => {
        this.setColor('gray');
    };

    this.setColor = (color) => {
        if (!this.isSorted()) {
            this.color = color;
        }
    };

    this.isSorted = () => this.color === 'green';

    this.sorted = () => {
        this.color = 'green';
    };

    this.setValue = (v, color) => {
        if (!this.isSorted()) {
            this.height = v;
            this.setColor(color);
        }
    };
    this.getValue = (v) => {
        return this.height;
    };
}

let array = RandomArray(array_size);
console.log(array);

let arrayMembers = array.map((v, i) => {
    return new ArrayMember(i * (canvas.width / array_size - 1) + i, 0, canvas.width / array_size - 1 , v * 1);
})

const drawAll = () => {
    arrayMembers.forEach((member) => {
        member.draw();
    })
} 
drawAll();


const ActionsMap = {
    [ACTIONS.SORT]: (action, members) => members[action.data].sorted(),
    [ACTIONS.COMPARE]: (action, members) => {
        const [i, j] = action.data;
        members[i].setColor('blue');
        members[j].setColor('blue');
    },
    [ACTIONS.SWAP]: (action, members) => {
        const [i, j] = action.data;
        let temp = members[j].getValue();
        members[j].setValue(members[i].getValue(), 'yellow');
        members[i].setValue(temp, 'red');
    },
    [ACTIONS.MERGE]: (action, members) => {
        const [k, temp] = action.data;
        members[k].setValue(temp, 'DarkGreen');
    },
    [ACTIONS.SELECT]: (action, members) => {
        members[action.data].setColor('blue');
    }
}



// bubble sort
function BubbleSort(array, onAction) {
    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false; 
        array_len = array.length;
        for (let i = 0; i < array_len; i++) {
            let count = 0;
            for (let j = 0; j < array_len - 1; j++) {
                onAction({type: ACTIONS.COMPARE, data: [j, j + 1]});
                if (array[j] > array[j + 1]) {
                    temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                    onAction({type: ACTIONS.SWAP, data: [j, j + 1]});
                }
                else {
                    count++;
                }
            }
            onAction({type: ACTIONS.SORT, data: array_len - i - 1});
            if (count == array_len) {
                return array;  // when array is finished sorting and there is no need for other iterations
            }
        }
        setTimeout(() => {
            sorting = false;
            Resize();
            EnableButtons();
        }, ticks * speed);
        return array;
    }
}

// insertion sort
function InsertionSort(array, onAction) {
    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false; 
        array_len = array.length;
        for (let i = 0; i < array_len; i++) {
            // for first num compare with adjacent num
            if (i == 0) {
                onAction({type: ACTIONS.COMPARE, data: [i, i + 1]});
                if (array[i] > array[i + 1]) {
                    let temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    onAction({type: ACTIONS.SWAP, data: [i, i + 1]});
                }
            }
            else {
                // compare the number with all the preceding numbers
                for (let j = i; j > 0; j--) {
                    onAction({type: ACTIONS.COMPARE, data: [j, j - 1]});
                    
                    if (array[j] < array[j - 1]) {
                        let temp = array[j];
                        array[j] = array[j - 1];
                        array[j - 1] = temp;
                        onAction({type: ACTIONS.SWAP, data: [j, j - 1]});
                    }
                }
                
                // color all the bars green to show finish sorting
                if (i == array_len - 1) {
                    for (let k = i; k >= 0; k--) {
                        onAction({type: ACTIONS.SORT, data: k});
                    }
                }
            }
        }
        setTimeout(() => {
            sorting = false;
            Resize();
            EnableButtons();
        }, ticks * speed);
        return array;
    }
    
}

async function MergeSort(array, onAction) {
    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false; 
        async function Merge(array, start, mid, end) {
            if (start == mid && mid == end) {
                return;
            }
            
            else {
                await Merge(array, start, Math.floor((mid-start)/2) + start, mid);
                await Merge(array, mid + 1, Math.floor((end-(mid+1))/2) + mid + 1, end);

                
                let temp = [];
                let i = start;
                let j = mid + 1;
                while (true) {
                    if (i > mid && j > end) {
                        break;
                    }
                    else if (i > mid) {
                        temp.push(array[j]);
                        j++;
                    }
                    else if (j > end) {
                        temp.push(array[i]);
                        i++;
                    }
                    else {
                        if (array[i] <= array[j]) {
                            temp.push(array[i]);
                            i++;
                        }
                        else if (array[j] <= array[i]) {
                            temp.push(array[j]);
                            j++;
                        }
                    }
                }
                
                let index = 0;
                for (let k = start; k <= end; k++) {
                    await wait();
                    array[k] = temp[index];
                    onAction({type: ACTIONS.MERGE, data: [k, temp[index]]});
                    index++;
                }
                

            }
        }
        
        await Merge(array, 0, Math.floor((array.length - 1) / 2), array.length - 1);
        
        sorting = false;
        
        console.log(array);
        checkArray(array);
        Resize();
        EnableButtons();
    }
}

// quick sort
async function QuickSort(array, s, end, onAction) {
    // recursively split into smaller compartments
    // with result from Quick()
    async function Compartment (array, s, end) {
        // base case
        if (s >= end) {
            if (array[s]) {
                onAction({type: ACTIONS.SORT, data: s});
                await wait();
            }
            return;
        }

        // get pivot point after sorting a portion
        let start, pivot;
        let list = await Quick(array, s,  end);
        if (list) {
            start = list[0];
            pivot = list[1];
        }
        else {
            // if there is no list (meaning smallest possible cell is reached)
            return;
        }
        
        // recursively sort
        await Compartment(array, start, pivot - 1);
        await Compartment(array, pivot + 1, end);
    }
    
    // sort the compartments
    async function Quick(array, start, pivot_index) {
        let low = start - 1;
        let high = pivot_index - 1;
        while (low <= high) {
            low++;
            onAction({type: ACTIONS.COMPARE, data: [low, high]});
            await wait();
            if (array[low] >= array[pivot_index]) {
                while (low <= high) {
                    if (array[high] <= array[pivot_index]) {
                        onAction({type: ACTIONS.SWAP, data: [low, high]});
                        await wait();
                        temp = array[low];
                        array[low] = array[high];
                        array[high] = temp;
                        break;
                    }
                    high--;
                }
            }
        }
        // move pivot to correct position
        onAction({type: ACTIONS.SWAP, data: [low, pivot_index]});
        await wait();
        onAction({type: ACTIONS.SORT, data: low});
        await wait();
        temp = array[low];
        array[low] = array[pivot_index];
        array[pivot_index] = temp;
        return [start, low];
    }

    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false; 
        await Compartment(array, s, end);

        sorting = false;
        console.log(array);
        checkArray(array);
        Resize();
        EnableButtons();
    }
}

// selection sort
async function SelectionSort(array, onAction) {
    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false;

        array_len = array.length;
        // iterate through the unsorted list
        for (let i = 0; i < array_len; i++) {
            // a list consisting of index and number [index, number]
            // compare number and save index of smaller number
            let smallest = [0, 510];
            for (let j = i; j < array_len; j++) {
                await wait();
                onAction({type: ACTIONS.SELECT, data: j});
                if (array[j] < smallest[1]) {
                    smallest[0] = j;
                    smallest[1] = array[j];
                }
            }

            // change smallest number position
            // with the 1st element of unsorted list
            await wait();
            onAction({type: ACTIONS.SWAP, data: [i, smallest[0]]});
            temp = array[i];
            array[i] = smallest[1];
            array[smallest[0]] = temp;

            // change sorted portion of array to green
            await wait();
            onAction({type: ACTIONS.SORT, data: i});
        }

        sorting = false;
        console.log(array);
        checkArray(array);
        Resize();
        EnableButtons();
    }
}

// test result of sort
function checkArray(array) {
    array_len = array.length;
    for (let i = 0; i < array_len - 1; i++) {
        if (array[i] > array[i + 1]) {
            console.log('fail sort');
            return false;
        }
    }
    console.log('sort success');
    return true;
}

// heap sort
async function HeapSort(array, onAction) {
    if (sorting == true) {
        return array;
    }
    else {
        DisableButtons();
        sorting = true; 
        new_array = false;

        let array_len = array.length;
        // for each node with children
        for (let i = array_len; i > 0; i--) {
            for (let j = Math.floor((array_len - 1) / 2); j >= 0; j--) {
                onAction({type: ACTIONS.SELECT, data: j});
                await wait();
                await MaxHeap(array, j, i);
            }

            // move the greatest number (root) to the end of the unsorted array
            let temp = array[0];
            array[0] = array[i - 1];
            array[i - 1] = temp;
            onAction({type: ACTIONS.SWAP, data: [i - 1, 0]});
            await wait();

            // change sorted portion of array to green
            onAction({type: ACTIONS.SORT, data: i - 1});
            await wait();
        }
        
        sorting = false;
        console.log(array);
        checkArray(array);
        Resize();
        EnableButtons();
    }
    
    async function MaxHeap(array, parent_index, unsorted_len) {
        // compare parent with children
        // make sure parent is greater than children
        let child_left = 2 * parent_index + 1;
        let child_right = 2 * parent_index + 2;
    
        // check if child exist
        // if exist compare with parent
        let largest_index = parent_index;
        let largest = array[parent_index];
        if (child_left < unsorted_len && largest < array[child_left]) {
            largest_index = child_left;
            largest = array[child_left];
        }
        if (child_right < unsorted_len && largest < array[child_right]) {
            largest_index = child_right;
            largest = array[child_left];
        }
    
        if (largest_index != parent_index) {
            let temp = array[parent_index];
            array[parent_index] = array[largest_index];
            array[largest_index] = temp;
            
            onAction({type: ACTIONS.SWAP, data: [parent_index, largest_index]});
            await wait();
    
            // recursively look down the affected subtree
            await MaxHeap(array, largest_index, unsorted_len);
        }
    }
}

// buttons on webpage
function Buttons() {
    // for changing sorting speed
    function SpeedButton() {
        let sp = document.querySelector('#speed');
        sp.addEventListener('change', () => {
            speed = parseInt(sp.value);
            console.log(`speed: ${speed}`);
        })
    }

    // change array size
    function SizeButton() {
        let size = document.querySelector('#size');
        size.addEventListener('change', () => {
            array_size = size.value;
            console.log(`array_size: ${array_size}`);

            document.querySelector('#newarray').click();
        })
    }

    // new array
    function NewArrayButton() {
        document.querySelector('#newarray').onclick = () => {
            if (sorting == false) {
                new_array = true;
                array_color = 'gray';
    
                array = RandomArray(array_size);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                arrayMembers = array.map((v, i) => {
                    return new ArrayMember(i * (canvas.width / array_size - 1) + i, 0, canvas.width / array_size - 1 , v * 1);
                })
                drawAll(arrayMembers);
                console.log("newarray");
                console.log(array);
            }
        }
    }

    // bubble sort button
    function BubbleButton() {
        document.querySelector('#bubblesort').onclick = () => {
            if (sorting == false && new_array == true) {
                console.log('bubble_sort');
                ticks = 0;
                array = BubbleSort(array, (action) => {
                    ticks++;
                    setTimeout(() => {
                        ActionsMap[action.type](action, arrayMembers);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawAll();
                        arrayMembers.forEach((m) => {
                            m.resetColor();
                        });
                    }, ticks * speed)
                });
                array_color = 'green';
                console.log(array);
                checkArray(array);
            }
        }
    }

    // insertion sort button
    function InsertionSortButton() {
        let button = document.querySelector('#insertionsort');
        button.onclick = () => {
            if (sorting == false && new_array == true) {
                console.log("insertion sort");
                ticks = 0;
                array = InsertionSort(array, (action) => {
                    ticks++;
                    setTimeout(() => {
                        ActionsMap[action.type](action, arrayMembers);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawAll();
                        arrayMembers.forEach((m) => {
                            m.resetColor();
                        })
                    }, speed * ticks);
                });
                array_color = 'green';
                console.log(array);
                checkArray(array);
            }
        }
    }

    // merge sort button
    function MergeSortButton() {
        document.querySelector('#mergesort').onclick = () => {
            if (sorting == false && new_array == true) {
                console.log('merge sort');
                MergeSort(array, (action) => {
                    ActionsMap[action.type](action, arrayMembers);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawAll();
                });
                array_color = 'DarkGreen';
            }
        }
    }

    // quick sort button
    function QuickSortButton() {
        document.querySelector('#quicksort').onclick = () => {
            if (sorting == false && new_array == true) {
                QuickSort(array, 0 , array.length - 1, (action) => {
                    ActionsMap[action.type](action, arrayMembers);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawAll();
                    
                    // if actions.merge change all bars to darkgreen
                    if (action.type != [ACTIONS.MERGE]) {
                        arrayMembers.forEach((m) => {
                            m.resetColor();
                        })
                    }
                });
                array_color = 'green';
            }
        }
    }

    function SelectionSortButton() {
        document.querySelector('#selectionsort').onclick = () => {
            if (sorting == false && new_array == true) {
                console.log('selection sort');
                SelectionSort(array, (action) => {
                    ActionsMap[action.type](action, arrayMembers);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawAll();
                    arrayMembers.forEach((m) => {
                        m.resetColor();
                    })
                });
                array_color = 'green';
            }
        }
    }

    function HeapSortButton() {
        document.querySelector('#heapsort').onclick = () => {
            if (sorting == false && new_array == true) {
                console.log('heap sort');
                HeapSort(array, (action) => {
                    ActionsMap[action.type](action, arrayMembers);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawAll();
                    arrayMembers.forEach((m) => {
                        m.resetColor();
                    })
                });
                array_color = 'green';
            }
        }
    }


    // call the functions
    SpeedButton();
    SizeButton();
    NewArrayButton();
    BubbleButton();
    InsertionSortButton();
    MergeSortButton();
    QuickSortButton();
    SelectionSortButton();
    HeapSortButton();
}
Buttons();

function DisableButtons() {
    document.querySelectorAll('button').forEach((button) => {
        button.disabled = true;
        button.style.opacity = 0.5;
    })
    document.querySelectorAll('#size').forEach((i) => {
        i.disabled = true;
        i.opacity = 0.5;
    })
}
function EnableButtons() {
    document.querySelectorAll('button').forEach((button) => {
        button.disabled = false;
        button.style.opacity = 1;
    })
    document.querySelectorAll('#size').forEach((i) => {
        i.disabled = false;
        i.opacity = 1;
    })
}


async function wait() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, speed * 10);
    });
}