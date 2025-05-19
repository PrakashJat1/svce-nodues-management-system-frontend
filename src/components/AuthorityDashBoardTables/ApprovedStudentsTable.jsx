import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";


// ag grid

import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import api from "../../api/axios";
import { Modal } from "react-bootstrap";

const ApprovedStudentsTable = ({authorityFromParent }) => {

  const [authority, setAuthority] = useState(authorityFromParent);
  const [allApprovedStudents, setAllApprovedStudents] = useState([]);
  const [approvedStudentsTable, setApprovedStudentsTable] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [rejectAllStudentModal,setRejectAllStudentModal] = useState(false);

  useEffect(() => {
    if (authorityFromParent) {
      approvedStudentsMethod(authorityFromParent);
    }
  }, [authorityFromParent]);
  

  const [studentTableColumnDefinition] = useState([
    {
      headerName: "SNo",
      field: "SNo",
      flex:1,
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

  const approvedStudentsMethod = async (authority) => {

    try {
      const response = await api.get(
        `/noduesstatus/approvedStudents/${authority.id}`
      );

      if (response.status === 200 && response.data) {
        toast.success(response.data.length+" Approved Student Fecthed");

        setAllApprovedStudents(response.data);

        setApprovedStudentsTable(
          response.data.map((student, index) => ({
            SNo: index+1,
            Name: student.studentName,
            EnrollmentId: student.enrollmentId,
            Email: student.email,
            Branch: student.branch,
            MobileNo: student.mobileNumber,
          }))
        );
      } else {
        toast.warn(" Not able to fetching Approved successful");
      }
    } catch (error) {
      toast.error("error while fetchinig Approved students");
      console.log("error while fetchinig Approved students", error);
    }
  };

  const rejectAll = async (authority) => {
    if (approvedStudentsTable.length == 0) {
      toast.info("No Pending Requests are remaining");
      return;
    }

    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warn("Please select students first");
      return;
    }

    const selectedStudentIds = allApprovedStudents
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
        const updatedData = approvedStudentsTable.filter(
          (student) =>
            !selectedRows.some(
              (selected) => selected.EnrollmentId === student.EnrollmentId
            )
        );
        setApprovedStudentsTable(updatedData);

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
          <h2>Approved Students   </h2> <h2 className=" fs-2 text-dark">{approvedStudentsTable.length}</h2>
          </div>
          <div className="d-flex me-lg-3  gap-3">
            <button
              className="btn btn-danger me-lg-5 me-sm-0"
              onClick={() =>setRejectAllStudentModal(true)}
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
          rowData={approvedStudentsTable}
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

      {/* Reject All Students Modal*/}
      <Modal
        centered
        show={rejectAllStudentModal}
        onHide={() => setRejectAllStudentModal(false)}
      >
        <div className="d-flex flex-column justify-content-center align-content-center m-5">
          <h3>Confirm Deletion🥲</h3>
          <p>
            Are you sure you want to Reject No Dues of All Selected Students ?
          </p>
          <div className="d-flex gap-4">
            <Button
              variant="danger"
              onClick={() => {
                rejectAll(authority);
                setRejectAllStudentModal(false);
              }}
            >
              Yes
            </Button>
            <Button onClick={() => setRejectAllStudentModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ApprovedStudentsTable;
