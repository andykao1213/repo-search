import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import StarIcon from '@material-ui/icons/Star';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import _ from 'lodash';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
  },
  container: {
    position: 'relative',
    marginTop: '50px',
    width: '60%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  catalog: {
    display:'flex',
    justifyContent: 'space-between',
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
  },
  repoName: {
    width: '35%'
  },
  repoDes: {
    width: '55%'
  },
  repoLang: {
    width: '10%'
  }
});

class SimpleTabs extends React.Component {

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  state = {
    searching: false,
    anchorEl: null,
    total_count: 0,
    repos: [],
    loading: false,
    searchKeyWord: '',
    page: 1,
    end: false,
  };

  fetchData(str, isAdding) {
    console.log('search');
    fetch(`https://api.github.com/search/repositories?q=${str}&page=${this.state.page}&per_page=10`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: 'GET'
    })
    .then(resp => {
      if(resp.ok) return resp.json();
      else throw Error(resp.statusText);
    })
    .then(data => {
      let {total_count, items} = data;
      if(!items.length){
        this.setState({
          end: true,
        });
        return;
      }
      this.setState({
        total_count: total_count,
        repos: isAdding? [...this.state.repos, ...items]:items,
        searching: true,
        loading: false,
        searchKeyWord: str,
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  handleScroll = event => {
    let distToBottom = Math.max(document.body.offsetHeight - (window.pageYOffset + window.innerHeight), 0);
    if (!this.state.loading && distToBottom <= 20 && !this.state.end) {
      console.log('page end')
      this.setState({
        loading: true,
        page: this.state.page + 1,
      });

      this.fetchData(this.state.searchKeyWord, true);
    }
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleKeyPress = event => {
    if(event.key === 'Enter'){
      if(event.target.value.trim() && event.target.value !== this.state.searchKeyWord)
        this.fetchData(event.target.value, false);
        this.setState({
          loading: true,
        })
    }
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <Typography 
            component="h2" 
            variant="h1" 
            gutterBottom
          >
            GitHub Repo Finder
          </Typography>
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
            onKeyPress = {this.handleKeyPress}
          />
          <List className={classes.root}>
            { 
              this.state.searching ? (
              <ListItem className={classes.catalog}>
                <Typography
                  variant="h6" 
                  gutterBottom
                >
                  {this.state.total_count} repository results
                </Typography>
                <Button
                  aria-owns={anchorEl ? 'simple-menu' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleClick}
                  className={classes.sortBtn}
                >
                  Sort: Best Match
                </Button>
                <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                  <MenuItem onClick={this.handleClose}>Stars</MenuItem>
                  <MenuItem onClick={this.handleClose}>Forks</MenuItem>
                  <MenuItem onClick={this.handleClose}>Best Match</MenuItem>
                </Menu>
              </ListItem>
              ) : ''
            }
            {
              _.map(this.state.repos, (repo, index) => 
              <div key = {index}>
                <Divider component="li" />
                <ListItem >
                  <ListItemText 
                    className={classes.repoName}
                    primary={
                      <Link href={repo.html_url} className={classes.link}>
                        {repo.full_name}
                      </Link>
                    } 
                    secondary={repo.language} 
                  />
                  <ListItemText 
                    secondary={repo.description} 
                    className={classes.repoDes}
                  />
                  <ListItemIcon
                    className={classes.repoLang}
                  >
                    <StarIcon />
                    <ListItemText primary={repo.stargazers_count} />
                  </ListItemIcon>
                </ListItem>
              </div>
              )
            }
            {
              this.state.loading && !this.state.end ? (
              <div className={classes.progress}>
                <CircularProgress />
              </div>
              ) : ''
            }
            
            
          </List>
        </div>
      </div>
    );
  }
}

SimpleTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTabs);