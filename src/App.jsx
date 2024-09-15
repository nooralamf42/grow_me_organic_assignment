// hello sir I would have seperated the components into different files but it would have taken more time to do so. 


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { OverlayPanel } from "primereact/overlaypanel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

function App() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [inputRows, setInputRows] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const op = useRef(null);
  const toast = useRef(null);

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setFirst(event.first);
    setRows(event.rows);
  };

  const tableColumns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Place of Origin" },
    { field: "artist_display", header: "Artist Display" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Date Start" },
    { field: "date_end", header: "Date End" },
  ];

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`
        );
        setArtworks(response.data.data);
        setTotalRecords(response.data.pagination.total);
      } catch (err) {
        setError(err.message);
        if (toast.current) {
          toast.current.show({severity:'error', summary: 'Error', detail: 'Failed to fetch artworks', life: 3000});
        }
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [page, rows]);

  const fetchAllArtworks = async (numRows) => {
    setLoading(true);
    try {
      const pagesNeeded = Math.ceil(numRows / rows);
      const requests = [];
      for (let i = 1; i <= pagesNeeded; i++) {
        requests.push(axios.get(`https://api.artic.edu/api/v1/artworks?page=${i}&limit=${rows}`));
      }
      const responses = await Promise.all(requests);
      const allData = responses.flatMap(response => response.data.data);
      return allData;
    } catch (err) {
      setError(err.message);
      if (toast.current) {
        toast.current.show({severity:'error', summary: 'Error', detail: 'Failed to fetch all artworks', life: 3000});
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const selectSpecifiedRows = (allArtworks, numRows) => {
    if (isNaN(numRows) || numRows <= 0) return;
    const selectedArtworks = allArtworks.slice(0, numRows);
    setSelectedProducts(selectedArtworks);
    setPage(1); 
  };

  const handleInputSubmit = async () => {
    const numRows = parseInt(inputRows);
    if (isNaN(numRows) || numRows <= 0) {
      if (toast.current) {
        toast.current.show({severity:'warn', summary: 'Warning', detail: 'Please enter a valid number', life: 3000});
      }
      return;
    }
    const allArtworks = await fetchAllArtworks(numRows);
    selectSpecifiedRows(allArtworks, numRows);
    if (op.current) {
      op.current.hide();
    }
    if (toast.current) {
      toast.current.show({severity:'success', summary: 'Success', detail: `Selected ${numRows} artworks`, life: 3000});
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container" style={{ position: "relative", padding: "20px", border: "1px solid #ddd", borderRadius: "4px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBlock: "50px" }}>
      {loading && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <ProgressSpinner />
        </div>
      )}
      <Toast ref={toast} />
      <OverlayPanel ref={op}>
        <div className="mb-3 gap-2">
          <InputText
            id="no_of_rows"
            placeholder="Number of rows"
            className="mr-2"
            value={inputRows}
            onChange={(e) => setInputRows(e.target.value)}
          />
          <Button 
            label="Submit" 
            className="p-button-success" 
            onClick={handleInputSubmit}
            style={{display:"block", marginLeft:"auto", marginTop:"10px"}}
          />
        </div>
      </OverlayPanel>
      <i
        onClick={(event) => op.current && op.current.toggle(event)}
        className="pi pi-chevron-down absolute bottom-0 m-10 inline-block"
        style={{
          fontSize: "1rem",
          position: "absolute",
          left: "0",
          top: "0",
          zIndex: "1000",
          marginLeft: "63px",
          marginTop: "48px",
          cursor: "pointer",
        }}
      ></i>
      <DataTable
        value={artworks}
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        {tableColumns.map(({ field, header }) => (
          <Column key={header} field={field} header={header}></Column>
        ))}
      </DataTable>
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default App;