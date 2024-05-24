'use client'
import React, { useState } from 'react';

function Home() {
    //add use State here

    // Function to handle changes for search with each box
    // handle submit button
    

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <div>
                <input
                    type="text"
                    placeholder="Search..."
                />
                <label>
                    <input
                        type="checkbox"
                     
                    />
                    Author
                </label>
                <label>
                    <input
                        type="checkbox"
                       
                    />
                    ISBN
                </label>
                <label>
                    <input
                        type="checkbox"
                    />
                    Title
                </label>
            </div>
            <button >Submit</button>
        </div>
    );
}

export default Home;
