import React from 'react';
import '../assets/styles/loaderCar.css';
import cronometroIcon from "../assets/icons/cronometro.svg"; // Keeping consistency if needed, but not used in the car svg itself

const LoaderCar = ({ message = "Cargando..." }) => {
    return (
        <div className="loader-car-overlay">
            <div className="loader-car-container">
                <svg viewBox="0 0 178 40" width="178" height="40">
                    <path
                        className="air"
                        d="M 46 16.5 h -20 a 8 8 0 0 1 0 -16"
                        fill="none"
                        stroke="#E85725"
                        strokeWidth="1"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    <g id="car">
                        <svg viewBox="0 0 118 28.125" x="30" y="11.725" width="118" height="28.125">
                            <defs>
                                <circle id="circle" cx="0" cy="0" r="1" />
                                <g id="wheel">
                                    <use href="#circle" fill="#1E191A" transform="scale(10)" />
                                    <use href="#circle" fill="#fff" transform="scale(5)" />
                                    <path
                                        fill="#1E191A"
                                        stroke="#1E191A"
                                        strokeWidth="0.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.2"
                                        strokeDashoffset="0"
                                        d="M -3.5 0 a 4 4 0 0 1 7 0 a 3.5 3.5 0 0 0 -7 0"
                                    />
                                    <use href="#circle" fill="#1E191A" transform="scale(1.5)" />
                                    <path
                                        fill="none"
                                        stroke="#F9B35C"
                                        strokeWidth="0.75"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="20 14 8 5"
                                        d="M 0 -7.5 a 7.5 7.5 0 0 1 0 15 a 7.5 7.5 0 0 1 0 -15"
                                    />
                                    <path
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.1"
                                        strokeDashoffset="0"
                                        d="M -6.5 -6.25 a 10 10 0 0 1 13 0 a 9 9 0 0 0 -13 0"
                                    />
                                </g>
                            </defs>
                            <g transform="translate(51.5 11.125)">
                                <path
                                    strokeWidth="2"
                                    stroke="#1E191A"
                                    fill="#EF3F33"
                                    d="M 0 0 v -2 a 4.5 4.5 0 0 1 9 0 v 2"
                                />
                                <rect fill="#1E191A" x="3.25" y="-3" width="5" height="3" />
                            </g>

                            <g transform="translate(10 24.125)">
                                <g transform="translate(59 0)">
                                    <path
                                        id="shadow"
                                        opacity="0.7"
                                        fill="#1E191A"
                                        d="M -64 0 l -4 4 h 9 l 8 -1.5 h 100 l -3.5 -2.5"
                                    />
                                </g>
                                <path
                                    fill="#fff"
                                    stroke="#1E191A"
                                    strokeWidth="2.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M 0 0 v -10 l 35 -13 v 5 l 4 0.5 l 0.5 4.5 h 35.5 l 30 13"
                                />
                                <g fill="#fff" stroke="#1E191A" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M -6 0 v -22 h 10 z" />
                                    <path d="M 105 0 h -3 l -12 -5.2 v 6.2 h 12" />
                                </g>
                                <g fill="#949699" opacity="0.7">
                                    <rect x="16" y="-6" width="55" height="6" />
                                    <path d="M 24 -14 l 13 -1.85 v 1.85" />
                                </g>
                                <g fill="none" stroke="#1E191A" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                    <path strokeDasharray="30 7 42" d="M 90 0 h -78" />
                                    <path d="M 39.5 -13 h -15" />
                                </g>
                                <path
                                    fill="#fff"
                                    stroke="#1E191A"
                                    strokeWidth="2.25"
                                    strokeLinejoin="round"
                                    d="M 48.125 -6 h -29 v 6 h 29"
                                />
                                <rect x="48" y="-7.125" width="6.125" height="7.125" fill="#1E191A" />
                                <g fill="#1E191A">
                                    <rect x="60" y="-15" width="1" height="6" />
                                    <rect x="56.5" y="-17.5" width="6" height="2.5" />
                                </g>
                            </g>

                            <g className="wheels" transform="translate(0 18.125)">
                                <g transform="translate(10 0)">
                                    <use href="#wheel" />
                                </g>
                                <g transform="translate(87 0)">
                                    <use href="#wheel" strokeDashoffset="-22" />
                                </g>
                            </g>
                        </svg>
                    </g>

                    <g fill="none" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                        <path className="air" stroke="#E85725" d="M 177.5 34 h -10 q -16 0 -32 -8" />
                        <path className="air" stroke="#949699" d="M 167 28.5 c -18 -2 -22 -8 -37 -10.75" />
                        <path className="air" stroke="#949699" d="M 153 20 q -4 -1.7 -8 -3" />
                        <path className="air" stroke="#E85725" d="M 117 16.85 c -12 0 -12 16 -24 16 h -8" />
                        <path className="air" stroke="#949699" d="M 65 12 q -5 3 -12 3.8" />
                        <path className="air" stroke="#949699" strokeDasharray="9 10" d="M 30 13.5 h -2.5 q -5 0 -5 -5" />
                        <path className="air" stroke="#949699" d="M 31 33 h -10" />
                        <path className="air" stroke="#949699" d="M 29.5 23 h -12" />
                        <path className="air" stroke="#949699" d="M 13.5 23 h -6" />
                        <path className="air" stroke="#E85725" d="M 28 28 h -27.5" />
                    </g>
                </svg>
            </div>
            <div className="loader-car-text">{message}</div>
        </div>
    );
};

export default LoaderCar;
