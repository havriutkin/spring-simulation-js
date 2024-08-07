﻿# 2D Spring Simulation

This is a simple 2D spring simulation implemented in JavaScript, which demonstrates the physics of a mass attached to a spring. The simulation takes into account gravity, air friction, and the spring constant, allowing you to visualize the behavior of a damped harmonic oscillator.

Deployed version [here](https://spring-simulation-js.onrender.com)

## Features

- Real-time simulation of a spring-mass system
- Adjustable spring constant, air friction, and mass
- Interactive: drag the mass with the mouse
- Dynamic canvas resizing for high DPI displays

## How It Works

The simulation consists of two particles: a fixed particle and a movable particle connected by a spring. The movable particle is subject to gravity, spring force, and air friction. The physics are calculated using a simple numerical integration method.

### Key Components

- **Vector2D Class**: Handles vector operations.
- **Particle Class**: Represents a particle with mass, position, velocity, and acceleration.
- **Spring Class**: Represents a spring connecting two particles and calculates the spring force.

## Usage

**Controls**:
   - **Spring Constant**: Adjust the spring constant using the input field.
   - **Air Friction**: Adjust the air friction using the input field.
   - **Mass**: Adjust the mass using the input field.
   - **Start**: Start the simulation.
   - **Stop**: Stop the simulation.
   - **Reset**: Reset the particle to the initial position.
   - **Dragging**: Left click on a ball while simulation is running.
