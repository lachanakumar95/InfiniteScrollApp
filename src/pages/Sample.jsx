import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import axios from 'axios';

export default function InfiniteScrollTable() {
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records from API
    const [lazyLoading, setLazyLoading] = useState(false); // Track loading state
    const [virtualProducts, setVirtualProducts] = useState([]); // Dynamically updated products array
    let loadLazyTimeout = null;

    // Function to load products lazily
    const loadProductsLazy = async (event) => {
        const { first = 0, rows = 10 } = event;

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
            >
                <Column field="id" header="S.No" style={{ width: '10%' }} />
                <Column field="title" header="Product Title" style={{ width: '30%' }} />
                <Column field="category" header="Category" style={{ width: '20%' }} />
                <Column field="description" header="Description" style={{ width: '40%' }} />
            </DataTable>
        </div>
    );
}
