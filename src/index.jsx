import React, { Component } from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
 
import formatCurrency from "./format-currency"

const defaultConfig = {
  locale: "en-US",
  formats: {
    number: {
      USD: {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};

class IntlCurrencyInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maskedValue: "0",
    }
  }

  setMaskedValue = (value=0) => {
    this.setState({
      maskedValue: formatCurrency(value, this.props.config, this.props.currency),
    });
  }

  componentDidMount() {
    const value = this.props.defaultValue || 0;
    this.setMaskedValue(value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currency !== this.props.currency) {
      const [value, maskedValue] = this.calculateValues(this.state.maskedValue, nextProps.config, nextProps.currency);
      this.setState({maskedValue: maskedValue});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps === this.props && nextState === this.state);
  }

  normalizeValue = str => {
    // strips everything that is not a number (positive or negative).
    return Number(str.replace(/[^0-9-]/g, ""))
  };

  calculateValues = (inputFieldValue, config, currency) => {
    // value must be divided by 100 to properly work with cents.
    const value = this.normalizeValue(inputFieldValue) / 100;
    const maskedValue = formatCurrency(value, config, currency);

    return [value, maskedValue];
  };

  updateValues = event => {
    const _event = {...event};
    const [value, maskedValue] = this.calculateValues(event.target.value, this.props.config, this.props.currency);

    this.setState({
      maskedValue,
    });

    return [value, maskedValue];
  };

  handleChange = event => {
    event.preventDefault();

    const [value, maskedValue] = this.updateValues(event);

    if (this.props.onChange) {
      this.props.onChange(event, value, maskedValue);
    }
  };

  handleBlur = event => {
    const [value, maskedValue] = this.updateValues(event);

    if (this.props.autoReset) {
      this.setMaskedValue();
    }

    if (this.props.onBlur) {
      this.props.onBlur(event, value, maskedValue);
    }
  };

  handleFocus = event => {
    if (this.props.autoSelect) {
      event.target.select();
    }

    const [value, maskedValue] = this.updateValues(event);

    if (this.props.onFocus) {
      this.props.onFocus(event, value, maskedValue);
    }
  };

  handleKeyPress = event => {
    if (this.props.onKeyPress) {
      this.props.onKeyPress(event, event.key, event.keyCode);
    }
  };

  handleInputRef = input => {
    const element = ReactDOM.findDOMNode(input);
    const isActive = element === document.activeElement;

    if (element && !isActive) {
      if (this.props.autoFocus) {
        element.focus();
      }
    }

    return element;
  };

  handleValue = () => {
    return this.state.maskedValue;
  };

  allowedProps = () => {
    const allowedProps = {...this.props};

    delete allowedProps.currency;
    delete allowedProps.config;
    delete allowedProps.autoSelect;
    delete allowedProps.autoFocus;
    delete allowedProps.autoReset;
    delete allowedProps.onChange;
    delete allowedProps.onKeyPress;
    delete allowedProps.onBlur;
    delete allowedProps.onFocus;

    return allowedProps;
  }

  render() {
    return(
      <input {...this.allowedProps()}
        value={this.handleValue()}
        ref={input => this.input = this.handleInputRef(input)}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyUp={this.handleKeyPress}
     />
    );
  }
};

IntlCurrencyInput.propTypes = {
  currency: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  defaultValue: PropTypes.number,
  autoFocus: PropTypes.bool,
  autoSelect: PropTypes.bool,
  autoReset: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyPress: PropTypes.func,
};

IntlCurrencyInput.defaultProps = {
  currency: "USD",
  config: defaultConfig,
  autoFocus: false,
  autoSelect: false,
  autoReset: false,
};

export default IntlCurrencyInput;
