/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import classNames from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const findCategoryById = id =>
  categoriesFromServer.find(category => category.id === id) || null;

const findUserById = id => usersFromServer.find(user => user.id === id) || null;

const products = productsFromServer.map(product => {
  const category = findCategoryById(product.categoryId);
  const user = findUserById(category?.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

const HEADERS = ['ID', 'Product', 'Category', 'User'];

const getPreparedProducts = (
  productsList,
  { selectedUser, selectedCategories, query, sort },
) => {
  let preparedProducts = [...productsList];

  if (selectedUser) {
    preparedProducts = preparedProducts.filter(product => {
      return product.user.name === selectedUser.name;
    });
  }

  if (selectedCategories.length !== 0) {
    preparedProducts = preparedProducts.filter(product => {
      return selectedCategories.includes(product.category.id);
    });
  }

  if (query) {
    const normalizedQuery = query.trim().toLowerCase();

    preparedProducts = preparedProducts.filter(product => {
      return product.name.toLowerCase().includes(normalizedQuery);
    });
  }

  if (sort.column !== 'none') {
    preparedProducts.sort((first, second) => {
      switch (sort.column) {
        case 'ID':
          return first.id - second.id;
        case 'Product':
          return first.name.localeCompare(second.name);
        case 'Category':
          return first.category.title.localeCompare(second.category.title);
        case 'User':
          return first.user.name.localeCompare(second.user.name);
        default:
          return 0;
      }
    });
  }

  if (sort.isReversed) {
    preparedProducts.reverse();
  }

  return preparedProducts;
};

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ column: 'none', isReversed: false });

  const handleSelectCategories = selectedCategory => {
    if (!selectedCategories.includes(selectedCategory)) {
      return setSelectedCategories([...selectedCategories, selectedCategory]);
    }

    return setSelectedCategories(
      selectedCategories.filter(category => category !== selectedCategory),
    );
  };

  const handleSelectSort = header => {
    if (sort.column !== header) {
      return setSort({ column: header, isReversed: false });
    }

    if (!sort.isReversed) {
      return setSort({ column: header, isReversed: true });
    }

    return setSort({ column: 'none', isReversed: false });
  };

  const handleResetFilters = () => {
    setSelectedUser(null);
    setSelectedCategories([]);
    setQuery('');
    setSort({ column: 'none', isReversed: false });
  };

  const isModified =
    selectedUser ||
    query !== '' ||
    selectedCategories.length !== 0 ||
    sort.column !== 'none';

  const preparedProducts = getPreparedProducts(products, {
    selectedUser,
    selectedCategories,
    query,
    sort,
  });

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={classNames({
                  'is-active': !selectedUser,
                })}
                onClick={() => setSelectedUser(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames({
                    'is-active': user.id === selectedUser?.id,
                  })}
                  onClick={() => setSelectedUser(user)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {Boolean(query) && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button is-success mr-6', {
                  'is-outlined': selectedCategories.length !== 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  href="#/"
                  className={classNames('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.id),
                  })}
                  onClick={() => handleSelectCategories(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className={classNames('button is-link is-fullwidth', {
                  'is-outlined': isModified,
                })}
                onClick={handleResetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {HEADERS.map(header => (
                    <th key={header}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {header}
                        <a href="#/" onClick={() => handleSelectSort(header)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort': sort.column !== header,
                                'fa-sort-up':
                                  sort.column === header && !sort.isReversed,
                                'fa-sort-down':
                                  sort.column === header && sort.isReversed,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preparedProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={classNames({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
