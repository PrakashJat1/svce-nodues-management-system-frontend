import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";

// ag grid

import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import api from "../../api/axios";
import RejectStudentNoDuesModal from "../Modals/RejectStudentNoDuesModal";

const PendingStudentsTable = ({ authorityFromParent }) => {
  const [authority, setAuthority] = useState(authorityFromParent);
  const [allPendingStudents, setAllPendingStudents] = useState([]);
  const [pendingStudentsTable, setPendingStudentsTable] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [rejectAllStudentModal,setRejectAllStudentModal] = useState(false);

  useEffect(() => {
    if (authorityFromParent) {
      pendingStudentsMethod(authorityFromParent);
    }
  }, [authorityFromParent]);

  const [studentTableColumnDefinition] = useState([
    {
      headerName: "SNo",
      field: "SNo",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Name",
      field: "Name",
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: "EnrollmentId",
      field: "EnrollmentId",
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Email",
      field: "Email",
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Branch",
      field: "Branch",
      flex: 1,
      filter: true,
      sortable: true,
      // hide: true,
    },
    {
      headerName: "MobileNo",
      field: "MobileNo",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Select",
      width: 100,
      headerCheckboxSelection: true, // Show checkbox in header
      checkboxSelection: true, // Show checkbox in each row
      flex: 1,
    },
  ]);

 
  const pendingStudentsMethod = async (authority) => {
    try {
      const response = await api.get(
        `/noduesstatus/pendingStudents/${authority.id}`
      );

      if (response.status === 200 && response.data) {
        toast.success(response.data.length+" Pending Requests Fetched");

        setAllPendingStudents(response.data);

        setPendingStudentsTable(
          response.data.map((student, index) => ({
            SNo: index + 1,
            Name: student.studentName,
            EnrollmentId: student.enrollmentId,
            Email: student.email,
            Branch: student.branch,
            MobileNo: student.mobileNumber,
          }))
        );
      } else {
        toast.warn(" Not able to pending fetching successful");
      }
    } catch (error) {
      toast.error("error while fetchinig pending students");
      console.log("error while fetchinig pending students", error);
    }
  };

  const approveAll = async (authority) => {
    if (pendingStudentsTable.length == 0) {
      toast.info("No Pending Requests are remaining");
      return;
    }

    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warn("Please select students first");
      return;
    }
    const selectedStudentIds = allPendingStudents
      .filter((student) =>
        selectedRows.some(
          (selected) => student.enrollmentId === selected.EnrollmentId
        )
      )
      .map((student) => student.id);

    try {
      const response = await api.post(
        `/noduesstatus/updateAllNoDuesStatus/${
          authority.id
        }/${"APPROVED"}`,
        selectedStudentIds
      );
      if (response.data) {
        toast.success("Approved ALL");
        const updatedData = pendingStudentsTable.filter(
          (student) =>
            !selectedRows.some(
              (selected) => selected.EnrollmentId === student.EnrollmentId
            )
        );

        setPendingStudentsTable(updatedData);
      } else {
        toast.error("Not Approved ALL");
      }
    } catch (error) {
      toast.error("error while update nodues status");
      console.log("error while update nodues status", error);
    }
  };

  const rejectAll = async (authority) => {
    if (pendingStudentsTable.length == 0) {
      toast.info("No Pending Requests are remaining");
      return;
    }

    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warn("Please select students first");
      return;
    }

    const selectedStudentIds = allPendingStudents
      .filter((student) =>
        selectedRows.some(
          (selected) => student.enrollmentId === selected.EnrollmentId
        )
      )
      .map((student) => student.id);

    try {
      const response = await api.post(
        `/noduesstatus/updateAllNoDuesStatus/${
          authority.id
        }/${"REJECTED"}`,
        selectedStudentIds
      );
      if (response.status === 200 && response.data) {
        const updatedData = pendingStudentsTable.filter(
          (student) =>
            !selectedRows.some(
              (selected) => selected.EnrollmentId === student.EnrollmentId
            )
        );
        setPendingStudentsTable(updatedData);

        toast.success("REJECTED ALL");
      } else {
        toast.error("Not Rejected All");
      }
    } catch (error) {
      toast.error("error while update nodues status");
      console.log("error while update nodues status", error);
    }
  };



  return (
    <>
      <div className="pending-request mt-4 mb-1 ms-4 me-1">
        <div className="d-flex gap-lg-3 gap-sm-2 align-items-center justify-content-between">
          <div className="d-flex gap-lg-4 gap-sm-1 align-items-center">
            <h2>Pending Requests </h2>{" "}
            <h2 className=" fs-2 text-dark">{pendingStudentsTable.length}</h2>
          </div>
          <div className="d-flex me-lg-3  gap-3">
            <button
              className="btn btn-success"
              onClick={() => approveAll(authority)}
            >
              Approve All
            </button>
            <button
              className="btn btn-danger me-lg-5 me-sm-0"
              onClick={() => setRejectAllStudentModal(true)}
            >
              Reject All
            </button>
          </div>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: "600px", width: "100%" }}
      >
        <AgGridReact
          rowData={pendingStudentsTable}
          columnDefs={studentTableColumnDefinition}
          rowSelection="multiple"
          onGridReady={(params) => setGridApi(params.api)}
          getRowId={(params) => params.data.EnrollmentId}
          paginationPageSize={10}
          pagination={true}
          paginationPageSizeSelector={[10, 20, 50, 100]} // Fix warning
          groupDisplayType="groupRows"
          animateRows={true}
          autoGroupColumnDef={{
            headerName: "Branch Group",
            cellRendererParams: {
              suppressCount: false,
            },
          }}
        />
      </div>

      {
        rejectAllStudentModal && <RejectStudentNoDuesModal rejectAll = {()=>rejectAll(authority)}/>
      }
    </>
  );
};

export default PendingStudentsTable;
