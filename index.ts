console.log("Starting loop. Press Ctrl+C or send SIGTERM to exit.");

// Flag to control the loop
let running: boolean = true;

// Function to handle termination signals
// NodeJS.Signals is the appropriate type for signals like SIGINT, SIGTERM
function gracefulShutdown(signal: NodeJS.Signals): void {
    console.log(`\nReceived ${signal}. Cleaning up and exiting...`);
    running = false; // Signal the loop to stop

    // Perform any cleanup tasks here if needed
    // e.g., close database connections, save state, etc.

    // Give the loop a moment to finish its current iteration if necessary,
    // or exit immediately if cleanup is done.
    console.log("Exited gracefully.");
    process.exit(0); // Exit with success code
}

// Register signal handlers
// SIGINT is typically sent by Ctrl+C
process.on('SIGINT', gracefulShutdown);
// SIGTERM is a generic termination signal (e.g., from `kill` command or process managers)
process.on('SIGTERM', gracefulShutdown);

// --- Example Loop ---
// Using setInterval for a non-blocking loop
// setInterval returns NodeJS.Timeout in Node.js environments (like Bun)
const intervalId: NodeJS.Timeout = setInterval(() => {
    if (!running) {
        clearInterval(intervalId);
        return;
    }
    console.log("Loop running... ", new Date().toLocaleTimeString());
    // Perform your looping task here
}, 1000); // Run every 1 second


// --- Alternative: Blocking Loop Example ---
/*
async function mainLoop(): Promise<void> { // Explicit return type Promise<void>
    while (running) {
        console.log("Loop running (blocking)... ", new Date().toLocaleTimeString());
        // Perform your looping task here
        // Add a small delay to prevent pegging the CPU
        // Use unknown for the resolve parameter type if very strict
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }
     console.log("Loop finished.");
}

// Uncomment the line below to run the blocking loop instead of setInterval
// mainLoop();
*/

// Keep the process alive. This isn't strictly necessary when using
// setInterval/setTimeout, but good practice otherwise.
// process.stdin.resume();


// Add a handler for unhandled rejections or exceptions if needed
// Use 'Error' type for the error parameter
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Decide if you want to exit on uncaught exceptions
  // process.exit(1); // Exit with error code
});

// Use 'unknown' or 'any' for reason, and 'Promise<any>' for promise
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
   // Decide if you want to exit on unhandled rejections
  // process.exit(1); // Exit with error code
});