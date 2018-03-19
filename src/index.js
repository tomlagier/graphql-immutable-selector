import { List, Map } from 'immutable';
import { parse, print } from 'graphql/language';
const { isMap } = Map;

const pathsFromNode = (
  node,
  currentPaths = List(),
  currentPrefix = List()
) => {
  const nextPath = currentPrefix.push(node.name.value);
  // Leaf node, push onto paths and return
  if (!node.selectionSet) {
    return currentPaths.push(nextPath);
  }

  return node.selectionSet.selections.reduce(
    (paths, selection) =>
      pathsFromNode(selection, paths, nextPath),
    currentPaths
  );
};

const selectionsFromDefinition = definition => {
  if (definition.operation !== 'query') {
    throw new TypeError(
      'Invalid operation found. Only queries are supported at this time'
    );
  }

  if (
    !definition.selectionSet ||
    !definition.selectionSet.selections
  ) {
    throw new RangeError('No nodes selected by GQL string');
  }

  return definition.selectionSet.selections;
};

export const getPathsFromAst = ast => {
  if (!ast || !ast.definitions) {
    throw new TypeError('Invalid path from graphql syntax');
  }

  const { definitions } = ast;

  // Reduce all definitions (multiple query fragments) down
  // to a single array
  return definitions.reduce((all, definition) => {
    const selections = selectionsFromDefinition(definition);

    // Fold all selections from a definition to a single array
    return all.concat(
      selections.reduce(
        (all, selection) =>
          all.concat(pathsFromNode(selection)),
        List()
      )
    );
  }, List());
};

export const graphqlImmutableSelector = gqlString => {
  const ast = parse(gqlString);
  const paths = getPathsFromAst(ast);

  return state => {
    if (!isMap(state))
      throw new TypeError(
        'Selected state was not a Map. Please provide a Map (use a wrapping Map or fromJS)'
      );

    return paths.reduce(
      (map, path) => map.setIn(path, state.getIn(path)),
      Map()
    );
  };
};
