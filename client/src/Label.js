import React from 'react';

const Label = props => {
    const x = props.x + props.dx;
    const y = props.y + props.dy;
    return (
        <text
            style={{
                fontWeight: 'bold',
                fontSize: '2px',
                transformOrigin: `${x}px ${y}px`,
                transform: `rotate(${props.dataEntry.startAngle + 187}deg)`,
            }}
            x={x}
            y={y}
        >
            {props.children}
        </text>
    );
}

export default Label;
