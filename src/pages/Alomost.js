import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';

export default function InfiniteScrollTable() {
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records from API
    const [lazyLoading, setLazyLoading] = useState(false); // Track loading state
    const [virtualProducts, setVirtualProducts] = useState([]); // Dynamically updated products array
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page (can be changed)
    const [visibleColumns, setVisibleColumns] = useState([
        { field: 'id', header: 'S.No' },
        { field: 'title', header: 'Product Title' },
        { field: 'category', header: 'Category' },
        { field: 'description', header: 'Description' },
    ]); // Default columns to show

    let loadLazyTimeout = null;

    // Function to load products lazily
    const loadProductsLazy = async (event) => {
        const { first = 0, rows = rowsPerPage } = event;

        if (lazyLoading) return; // Prevent duplicate loading
        setLazyLoading(true);

        loadLazyTimeout = await axios
            .get(`https://dummyjson.com/products?limit=${rows}&skip=${first}`)
            .then((response) => {
                const data = response.data;

                // Update total records based on API response
                setTotalRecords(data.total);

                // Dynamically update virtualProducts
                setVirtualProducts((prevProducts) => {
                    const updatedProducts = [...prevProducts];

                    // Ensure placeholders for unfetched rows
                    for (let i = updatedProducts.length; i < totalRecords; i++) {
                        updatedProducts[i] = null;
                    }

                    // Insert fetched data into the correct positions
                    data.products.forEach((product, index) => {
                        updatedProducts[first + index] = product;
                    });

                    return updatedProducts;
                });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLazyLoading(false); // Reset loading state
            });
    };

    // Handle rows per page change
    const onRowsPerPageChange = (event) => {
        setRowsPerPage(event.value);
        // Reset the virtual products array to reload data when rows per page is changed
        setVirtualProducts([]);
        loadProductsLazy({ first: 0, rows: event.value });
    };

    // Loading skeleton template
    const loadingTemplate = (options) => {
        return (
            <div
                className="flex align-items-center"
                style={{ height: '1.5rem', flexGrow: '1', overflow: 'hidden' }}
            >
                <Skeleton
                    width={options.cellEven ? (options.field === 'description' ? '40%' : '50%') : '70%'}
                    height="1rem"
                />
            </div>
        );
    };

    // Handle column toggle
    const onColumnToggle = (event) => {
        setVisibleColumns(event.value);
    };

    // Header with MultiSelect for column toggle
    const header = (<>
        <div className="grid">
            <div className="col-12 md:col-4">
                <div className="p-d-flex p-jc-between p-ai-center" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="rows-per-page">Rows per page: </label>
                    <select
                        id="rows-per-page"
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(e.target)}
                        className="p-inputtext p-component"
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            <div className='col-12 md:col-4'></div>
            <div className="col-12 md:col-4">
                <div className="p-d-flex p-jc-between p-ai-center">
                    <label htmlFor="rows-per-page">Column wise show </label>
                    <MultiSelect
                        value={visibleColumns}
                        options={[
                            { field: 'id', header: 'S.No' },
                            { field: 'title', header: 'Product Title' },
                            { field: 'category', header: 'Category' },
                            { field: 'description', header: 'Description' },
                        ]}
                        onChange={onColumnToggle}
                        optionLabel="header"
                        className="w-full"
                        display="chip"
                        style={{marginTop: "5px"}}
                    />
                </div>
            </div>
        </div>       
    </>);

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
                rows={rowsPerPage} // Set the number of rows per page
                paginator={false} // Disable built-in pagination
                header={header} // Add header with column toggle
            >
                {visibleColumns.map((col) => (
                    <Column key={col.field} field={col.field} header={col.header} />
                ))}
            </DataTable>
        </div>
    );
}
