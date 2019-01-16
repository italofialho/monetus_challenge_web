import React, { Component } from "react";
import axios from "axios";
import _ from "underscore";

import MonetusLogo from "../../Assets/Icons/monetus-logo.png";
import ActionsSectionComponent from "../ActionsSectionComponent";
import { SearchRow, Image, SearchInput, Small } from "./StyledComponents";
import swal from "sweetalert2";

export default class Actions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			symbol: "",
			typing: false,
			typingTimeout: 0,
		};
	}

	async componentDidMount() {
		await this.getSymbols();
		await this.getUserSymbols();
	}

	getSymbols = async () => {
		try {
			this.props.dispatch({
				type: "UPDATE_LOADING_TEXT",
				data: "Carregando lista de simbolos...",
			});
			const { data } = await axios.get("https://api.iextrading.com/1.0/ref-data/symbols");
			this.props.dispatch({
				type: "UPDATE_SYMBOLS",
				data: data,
			});
		} catch (error) {
			console.log("getUserSymbols error:", error);
		}
	};

	getUserSymbols = async () => {
		try {
			this.props.dispatch({
				type: "UPDATE_LOADING_TEXT",
				data: "Carregando lista de ações...",
			});

			const userSymbolsString = await localStorage.getItem("userSymbols");
			const userSymbols = JSON.parse(userSymbolsString);
			this.props.dispatch({
				type: "UPDATE_USER_SYMBOLS",
				data: userSymbols,
			});

			this.fetchDetailsBySymbol(userSymbols);
		} catch (error) {
			console.log("getUserSymbols error:", error);
		}
	};

	fetchDetailsBySymbol = async symbols => {
		const promiseArr = [];

		_.each(symbols, symbol => {
			const currentSymbol = String(symbol).toLowerCase();
			promiseArr.push(axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`));
		});

		let symbolDetails = await Promise.all(promiseArr);
		symbolDetails = _.map(symbolDetails, "data");

		this.props.dispatch({
			type: "UPDATE_ACTIONS_DETAILS",
			data: symbolDetails,
		});

		this.props.dispatch({
			type: "UPDATE_STATE",
			state: { isAvailable: true },
		});
	};

	onChangeText = text => {
		this.setState({ isLoading: true, value: text });
	};

	addNewSymbol = async symbol => {
		if (!symbol) {
			swal({
				type: "error",
				title: "Oops...",
				text: "Você precisa digitar um simbolo.",
			});
			return;
		}

		const userSymbolsString = await localStorage.getItem("userSymbols");
		let userSymbols = JSON.parse(userSymbolsString);
		if (!userSymbols) userSymbols = [];

		symbol = String(symbol).toUpperCase();

		const findSymbol = _.findWhere(this.props.actionsDetails, { symbol });
		const symbolExists = _.findWhere(this.props.symbols, { symbol });
		if (findSymbol) {
			swal({
				type: "error",
				title: "Oops...",
				text: "Você já adicionou esse simbolo.",
			});
			this.setState({ symbol: "" });
			return;
		}

		if (!symbolExists) {
			swal({
				type: "error",
				title: "Oops...",
				text: "Não encontramos a simbolo informado.",
			});
			this.setState({ symbol: "" });
			return;
		}

		userSymbols.push(String(symbol).toUpperCase());

		this.props.dispatch({
			type: "UPDATE_USER_SYMBOLS",
			data: userSymbols,
		});

		this.setState({ symbol: "" });

		await localStorage.setItem("userSymbols", JSON.stringify(userSymbols));
	};

	changeSymbol = event => {
		if (this.state.typingTimeout) {
			clearTimeout(this.state.typingTimeout);
		}

		this.setState({
			symbol: event.target.value,
			typingTimeout: setTimeout(() => {
				this.addNewSymbol(this.state.symbol);
			}, 3000),
		});
	};

	renderNewActionInput = () => {
		return (
			<SearchRow>
				<Image src={MonetusLogo} />
				<SearchInput
					placeholder="Informe o simbolo de uma ação para adicionar"
					onChange={e => this.changeSymbol(e)}
				/>
				<Small>Aguarde 3 segundos, depois de digitar, para realizarmos todas as validações!</Small>
			</SearchRow>
		);
	};

	render() {
		return (
			<div>
				{this.renderNewActionInput()}
				{_.size(this.props.userSymbols) &&
					_.map(this.props.userSymbols, (symbol, index) => {
						return <ActionsSectionComponent symbol={symbol} key={index} />;
					})}
			</div>
		);
	}
}
