import React from "react";
import styled from "styled-components";

export const SearchRow = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 10px;
	width: 100%;
`;

export const Image = styled.img`
	width: 25vh;
	height: 25vh;
	resize-mode: contain;
	padding: 20px;
`;

export const SearchInput = styled.input`
	width: 95vw;
	border: 1px solid #0047bb;
	background-color: #fff;
	padding: 10px;
`;

export const Small = styled.small`
	color: #657786;
	font-size: 12px;
`;
