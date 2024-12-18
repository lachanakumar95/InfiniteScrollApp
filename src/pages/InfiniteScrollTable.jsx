import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';

export default function InfiniteScrollTable() {
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyLoading, setLazyLoading] = useState(false);
    const [virtualProducts, setVirtualProducts] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState([
        { field: 'id', header: 'S.No' },
        { field: 'title', header: 'Product Title' },
        { field: 'category', header: 'Category' },
        { field: 'description', header: 'Description' },
        { field: 'brand', header: 'Brand' },
    ]);
    const [filters, setFilters] = useState({
        id: { value: '', matchMode: 'contains' },
        title: { value: '', matchMode: 'contains' },
        category: { value: '', matchMode: 'contains' },
        description: { value: '', matchMode: 'contains' },
        brand: { value: '', matchMode: 'contains' },
    });

    const loadProductsLazy = async (event) => {
        const { first = 0, rows = rowsPerPage } = event;

        if (lazyLoading) return; 
        setLazyLoading(true);

        const filterParams = Object.keys(filters).reduce((acc, key) => {
            if (filters[key].value) {
                acc[key] = filters[key].value;
            }
            return acc;
        }, {});

        try {
            const response = await axios.get('https://dummyjson.com/products', {
                params: {
                    limit: rows === 'all' ? totalRecords : rows,
                    skip: rows === 'all' ? 0 : first,
                    ...filterParams,
                },
            });

            const data = response.data;
            setTotalRecords(data.total);

            if (rows === 'all') {
                setVirtualProducts(data.products);
            } else {
                //merge new data into the existing array
                setVirtualProducts((prevProducts) => {
                    const updatedProducts = [...prevProducts];
                    for (let i = updatedProducts.length; i < totalRecords; i++) {
                        updatedProducts[i] = null;
                    }
                    data.products.forEach((product, index) => {
                        updatedProducts[first + index] = product; // Add fetched data
                    });
                    return updatedProducts;
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLazyLoading(false);
        }
    };
  // Handle changes in rows per page
    const onRowsPerPageChange = (event) => {
        const value = event.target.value;
        setRowsPerPage(value);
        setVirtualProducts([]);
        loadProductsLazy({ first: 0, rows: value === 'all' ? 'all' : value });
    };
// Template for loading skeleton
    const loadingTemplate = (options) => {
        return (
            <div className="flex align-items-center" style={{ height: '1.5rem', flexGrow: '1', overflow: 'hidden' }}>
                <Skeleton width={options.cellEven ? (options.field === 'description' ? '40%' : '50%') : '70%'} height="1rem" />
            </div>
        );
    };
// Handle column visibility toggle
    const onColumnToggle = (event) => {
        setVisibleColumns(event.value);
    };

    const header = (
        <div className="grid">
            <div className="col-12 md:col-4">
                <div className="p-d-flex p-jc-between p-ai-center" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="rows-per-page">Rows per page: </label>
                    <select
                        id="rows-per-page"
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(e)}
                        className="p-inputtext p-component"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value="all">All</option>
                    </select>
                </div>
            </div>
            <div className="col-12 md:col-4">
                <img src="https://salieabs.com/wp-content/uploads/2024/07/Salieabs_logo.png" 
                style={{ width: "220px" }} 
                alt="" />
            </div>
            <div className="col-12 md:col-4">
                <div className="p-d-flex p-jc-between p-ai-center">
                    <label htmlFor="columns-toggle">Column wise show </label>
                    <MultiSelect
                        value={visibleColumns}
                        options={[
                            { field: 'id', header: 'S.No' },
                            { field: 'title', header: 'Product Title' },
                            { field: 'category', header: 'Category' },
                            { field: 'description', header: 'Description' },
                            { field: 'brand', header: 'Brand' },
                        ]}
                        onChange={onColumnToggle}
                        optionLabel="header"
                        className="w-full"
                        display="chip"
                        style={{ marginTop: '5px' }}
                    />
                </div>
            </div>
        </div>
    );
 // Handle column filtering
    const onFilter = (e) => {
        const { name, value } = e.target; // Extract filter value
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: { ...prevFilters[name], value },
        }));
        loadProductsLazy({ first: 0, rows: rowsPerPage }); // Reload filtered data
    };

    const columnFilter = (field) => {
        return (
            <input
                type="text"
                value={filters[field]?.value || ''}
                onChange={(e) => onFilter(e)}
                name={field}
                placeholder={`Search ${field}`}
                className="p-inputtext p-component"
            />
        );
    };

    useEffect(() => {
        loadProductsLazy({ first: 0, rows: rowsPerPage });
    }, [rowsPerPage]);

    return (
        <div className="card">
            <DataTable
                value={virtualProducts}
                scrollable
                scrollHeight="500px"
                virtualScrollerOptions={{
                    lazy: true,
                    onLazyLoad: loadProductsLazy,
                    itemSize: 46,
                    delay: 200,
                    showLoader: true,
                    loading: lazyLoading,
                    loadingTemplate,
                }}
                totalRecords={totalRecords}
                tableStyle={{ minWidth: '50rem' }}
                rows={rowsPerPage}
                paginator={false}
                header={header}
                filters={filters}
            >
                {visibleColumns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        filter={true}
                        filterElement={columnFilter(col.field)}
                    />
                ))}
            </DataTable>
        </div>
    );
}
