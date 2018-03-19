const { describe, it } = require('mocha');
const { expect } = require('chai');
const {
  getPathsFromAst,
  graphqlImmutableSelector
} = require('../dist/bundle');
const { fromJS } = require('immutable');
const { parse, print } = require('graphql/language');

const simpleGql = 'query { user { name } }';
const nestedGql = `
query {
  user {
    name
    friends {
      name
      photo
    }
    enemies {
      name
      address
    }
  }
}`;

describe('getPathsFromAst', () => {
  it('should exist', () => {
    expect(getPathsFromAst).to.exist;
    expect(typeof getPathsFromAst).to.eq('function');
  });

  it('should parse a simple query into a single path', () => {
    const paths = getPathsFromAst(parse(simpleGql));
    expect(paths.toJS()).to.deep.eq([['user', 'name']]);
  });

  it('should parse a nested query into a set of paths', () => {
    const paths = getPathsFromAst(parse(nestedGql));
    expect(paths.toJS()).to.deep.eq([
      ['user', 'name'],
      ['user', 'friends', 'name'],
      ['user', 'friends', 'photo'],
      ['user', 'enemies', 'name'],
      ['user', 'enemies', 'address']
    ]);
  });
});

describe('graphqlImmutableSelector', () => {
  it('should exist', () => {
    expect(graphqlImmutableSelector).to.exist;
  });
  it('should return a function', () => {
    expect(
      typeof graphqlImmutableSelector(simpleGql)
    ).to.eq('function');
  });

  const MockUser = fromJS({
    user: {
      name: 'Ted',
      job: 'Flunky',
      hours: '9-5'
    }
  });

  it('should correctly parse simple graphql', () => {
    expect(
      graphqlImmutableSelector(simpleGql)(MockUser).toJS()
    ).to.deep.eq({
      user: {
        name: 'Ted'
      }
    });
  });
});
