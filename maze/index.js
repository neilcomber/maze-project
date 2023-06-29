const buildGame = ()=> {

    document.querySelector('.winner').classList.add('hidden');
    // Matter Engine
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 5;
const cellsVertical = 5;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width/ cellsHorizontal;

const unitLengthY = height/ cellsVertical;


const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body, 
    engine: engine, 
    options: {
        width,
        height, 
        wireframes: false
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);


// Walls
const walls = [
    Bodies.rectangle(width/2, 0, width, 4, {
        isStatic: true
    }), 
    Bodies.rectangle(width/2, height, width, 4, {
        isStatic: true
    }), 
    Bodies.rectangle(0, height/2, 4, height, {
        isStatic: true
    }), 
    Bodies.rectangle(width, height/2, 4, height, {
        isStatic: true
    })
    
];

World.add(world, walls);

// maze generation

const shuffle = (arr) => {
    let counter = arr.length;
    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null).map(()=> Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(()=> Array(cellsHorizontal-1).fill(false));

const horizontals = Array(cellsVertical-1).fill(null).map(()=> Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);

const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column)=> {
// if i have visited this cell, then return

if (grid[row][column]) {
    return;
}

// Mark this cell as being visited

grid[row][column] = true;

//assemble randomly ordered list of neighbours

const neighbours = shuffle([
    [row-1, column, 'up'], 
    [row+1, column, 'down'], 
    [row, column+1, 'right'], 
    [row, column-1, 'left']
]);

//For each neighbour....

for(let neighbour of neighbours) {
const [nextRow, nextColumn, direction] = neighbour;

//see if that neighbour is out of bounds (e.g. you are at the edge and it doesnt exist), if so continue to next neighbour

if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
    continue;
}
//see if we have visited already, if so continue to next neighbour
if (grid[nextRow][nextColumn]) {
    continue;
}

// remove wall from either vertical or horizontal array to move to fresh cell
if (direction === 'left') {
    verticals[row][column-1] = true;
} else if (direction === 'right') {
    verticals[row][column] = true;
} else if(direction === 'down') {
    horizontals[row][column] = true;
} else if(direction === 'up') {
    horizontals[row-1][column] = true;
}

stepThroughCell(nextRow, nextColumn);
}

// visit that next cell (recall step through cell with new cell + row)


// stepThroughCell(nextRow, nextColumn);

};

stepThroughCell(startRow, startColumn);

//Render internal Horizontal Walls

horizontals.forEach((row, rowIndex)=>{
     row.forEach((open, columnIndex) => {
        if (open){
            return;
        }

        const wall = Bodies.rectangle(columnIndex * unitLengthX + unitLengthX / 2, rowIndex * unitLengthY + unitLengthY, unitLengthX, 10, {
            label: 'wall', 
            isStatic: true,
            render: {
                fillStyle: 'red'
            }
        });
        World.add(world, wall);
     })
})


//Render internal Horizontal Walls

verticals.forEach((row, rowIndex)=> {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall= Bodies.rectangle(columnIndex * unitLengthX + unitLengthX, rowIndex * unitLengthY + unitLengthY / 2, 10, unitLengthY, {
            label: 'wall', 
            isStatic: true, 
            render: {
                fillStyle: 'red'
            }
        });
        World.add(world, wall);

})})

//Goal

const goal = Bodies.rectangle(width-unitLengthX/2, height-unitLengthY/2, unitLengthX *.7, unitLengthY * .7, {
    label: 'goal',
    isStatic: true, 
    render: {
        fillStyle: 'green'
    }
});

World.add(world, goal);

//Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) *.25;
const ball= Bodies.circle(unitLengthX/2, unitLengthY/2, ballRadius, {
    label: 'ball', 
    render: {
        fillStyle: 'blue'
    }
});

World.add(world, ball);

//Moving Ball

document.addEventListener('keydown', event => {
    const {x,y} = ball.velocity
    // console.log(event)
    // console.log (ball.velocity)
    if (event.key === 'w') {
        Body.setVelocity(ball, {x: x, y: y-5})
    }
    if (event.key === 'd') {
        Body.setVelocity(ball, {x: x + 5, y: y})
        
    }
    if (event.key === 's') {
        Body.setVelocity(ball, {x: x, y: y+5})
        
    }
    if (event.key === 'a') {
        Body.setVelocity(ball, {x: x-5, y})
        
    }

    }
)

// Win Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        // console.log(collision);
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y = 1;
           world.bodies.forEach((body)=> {
            if (body.label === 'wall') {
                Body.setStatic(body, false);
            }
            document.querySelector('.winner').classList.remove('hidden');
            document.querySelector('button').addEventListener('click', (event) => {
                event.preventDefault();
                World.clear(world);
                Engine.clear(engine);
                Render.stop(render);
                // Runner.stop(runner);
                render.canvas.remove();
                render.canvas = null;
                render.context = null;
                render.textures = {};
                buildGame();
            })
           })

        }
    })
})
}

buildGame();
