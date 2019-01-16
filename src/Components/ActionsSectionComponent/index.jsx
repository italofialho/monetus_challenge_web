import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";
import _ from "underscore";
import { PriceSection, PriceSectionTop, PriceSectionBottom } from "./StyledComponents";
import AnimatedNumber from "react-animated-number";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
class ActionsSectionComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value: 0,
			fixed: 2,
			loading: true,
			symbolDetail: {},
			showDetails: false,
			symbolChart: [],
			lastUpdateTimeOut: 0,
			updating: false,
			intervalId: null,
		};
	}

	componentDidMount() {
		this.fetchDetailsBySymbol(this.props.symbol);
		this.startAutoUpdate();
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	startAutoUpdate() {
		const intervalId = setInterval(() => {
			this.setState({ lastUpdateTimeOut: this.state.lastUpdateTimeOut - 1 }, () => {
				if (this.state.lastUpdateTimeOut === 0) {
					this.updateDetailsBySymbol(this.props.symbol);
				}
			});
		}, 1000);
		this.setState({ intervalId });
	}

	fetchDetailsBySymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			this.setState({ loading: true });
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`);
			this.setState({ symbolDetail: data, value: data.latestPrice, loading: false, lastUpdateTimeOut: 60 });
		} catch (error) {
			console.log("fetchDetailsBySymbol error:", error);
			this.setState({ loading: false });
		}
	};

	updateDetailsBySymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			this.setState({ updating: true });
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/quote`);
			this.setState({ symbolDetail: data, value: data.latestPrice, updating: false, lastUpdateTimeOut: 60 });
		} catch (error) {
			console.log("fetchDetailsBySymbol error:", error);
			this.setState({ updating: false });
		}
	};

	loadChartForSymbol = async symbol => {
		try {
			let currentSymbol = String(symbol).toLowerCase();
			let { data } = await axios.get(`https://api.iextrading.com/1.0/stock/${currentSymbol}/chart/dynamic`);
			this.setState({ symbolChart: data.data, loading: false });
		} catch (error) {
			console.log("loadChartForSymbol error:", error);
			this.setState({ loading: false });
		}
	};

	numberWithCommas = x => {
		return Number(x).toLocaleString("pt-BR", {
			style: "decimal",
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		});
	};

	toggleDetails = () => {
		const newState = !this.state.showDetails;
		if (newState) {
			this.loadChartForSymbol(this.props.symbol);
		}
		this.setState({ showDetails: newState });
	};

	renderDetails() {
		const { symbolChart } = this.state;

		if (!_.size(symbolChart) > 0) {
			return (
				<div>
					<span style={{ textAlign: "center", color: "#657786" }}>Carregando graficos...</span>
				</div>
			);
		}

		const max = _.max(symbolChart, item => {
			return item.average;
		}).average;

		let updatesCount = 50;

		return (
			<div>
				<LineChart
					width={window.screen.width - 100}
					height={300}
					data={_.chain(symbolChart)
						.last(updatesCount)
						.map((item, idx) => ({
							average: item.average,
							high: item.high,
							low: item.low,
							name: item.minute,
						}))
						.value()}
					margin={{ top: 5, bottom: 5 }}>
					<XAxis dataKey="name" />
					<YAxis />
					<CartesianGrid strokeDasharray="3 3" />
					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="average" stroke="#0146BB" />
					<Line type="monotone" dataKey="high" stroke="#2520A8" />
					<Line type="monotone" dataKey="low" stroke="#430199" />
                </LineChart>
                <span style={{ paddingHorizontal: 20, color: "#657786" }}>
					Exibindo as ultimas {updatesCount} atualizações.
				</span>
			</div>
		);
	}

	render() {
		const { loading, symbolDetail, showDetails, lastUpdateTimeOut, updating } = this.state;
		return (
			<PriceSection>
				<PriceSectionTop onClick={() => this.toggleDetails()}>
					{this.props.symbol}&nbsp;
					<AnimatedNumber
						component="span"
						value={this.state.value}
						style={{
							transition: "0.8s ease-out",
							transitionProperty: "background-color, color, opacity",
						}}
						duration={300}
						formatValue={n => this.numberWithCommas(n.toFixed(this.state.fixed))}
					/>
				</PriceSectionTop>
				<PriceSectionBottom>
					{loading ? "Carregando informações..." : symbolDetail.companyName}
				</PriceSectionBottom>
				<PriceSectionBottom>
					{updating
						? "Atualizando..."
						: !loading && lastUpdateTimeOut > 0 && `Atualizando em ${lastUpdateTimeOut}s.`}
				</PriceSectionBottom>
				{showDetails && this.renderDetails()}
			</PriceSection>
		);
	}
}

const mapStateToProps = state => {
	return { ...state };
};

export default connect(mapStateToProps)(ActionsSectionComponent);
