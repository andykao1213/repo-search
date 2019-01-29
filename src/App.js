import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { FormHelperText } from '@material-ui/core';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
  },
  container: {
    position: 'relative',
    display: 'flex',
    width: '60%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
});

class SimpleTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <TextField
            id="outlined-full-width"
            style={{ margin: 8 }}
            placeholder="Search Repo"
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        
      </div>
    );
  }
}

SimpleTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTabs);