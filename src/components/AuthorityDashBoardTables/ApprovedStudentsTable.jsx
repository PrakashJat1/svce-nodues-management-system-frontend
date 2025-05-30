import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// ag grid

import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import api from "../../api/axios";
import { Modal, Button } from "react-bootstrap";

const ApprovedStudentsTable = ({ authorityFromParent }) => {
  const [authority, setAuthority] = useState(authorityFromParent);
  const [allApprovedStudents, setAllApprovedStudents] = useState([]);
  const [approvedStudentsTable, setApprovedStudentsTable] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [rejectAllStudentModal, setRejectAllStudentModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejectionModal, setCustomRejectionModal] = useState(false);

  useEffect(() => {
    if (authorityFromParent) {
      approvedStudentsMethod(authorityFromParent);
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

  const approvedStudentsMethod = async (authority) => {
    try {
      const response = await api.get(
        `/noduesstatus/approvedStudents/${authority.id}`
      );

      if (response.status === 200 && response.data) {
        toast.success(response.data.length + " Approved Student Fecthed");

        setAllApprovedStudents(response.data);

        setApprovedStudentsTable(
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
    } else if (rejectionReason.trim() === "") {
      toast.warn("Please give reason of rejection");
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
        }/${"REJECTED"}/${rejectionReason}`,
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
            <h2>Approved Students </h2>{" "}
            <h2 className=" fs-2 text-dark">{approvedStudentsTable.length}</h2>
          </div>
          <div className="d-flex me-lg-3  gap-3">
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
        <div
          className="p-4 rounded-4"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h4 className="text-center fw-semibold mb-4">
            📌 Reason for No Dues Rejection
          </h4>

          <Modal.Body>
            <select
              className="form-select mb-3 shadow-sm rounded-3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              style={{ background: "#f8f9fa" }}
            >
              <option value="" disabled >
                -- Select a reason --
              </option>
              <option>Fee receipt required</option>
              <option>Book return proof required</option>
              <option>Fine payment receipt required</option>
              <option>Submit project report</option>
              <option>Internship letter required</option>
              <option>Please visit the department</option>
            </select>
          </Modal.Body>

          <div className="d-flex justify-content-end gap-3 px-3 pb-3">
            <Button
              variant="danger"
              className="rounded-pill px-4"
              onClick={() => {
                rejectAll(authority);
                setRejectAllStudentModal(false);
              }}
            >
              🚫 Confirm
            </Button>

            <Button
              variant="secondary"
              className="rounded-pill"
              onClick={() => {
                setRejectAllStudentModal(false);
                setCustomRejectionModal(true);
              }}
            >
              ✏️ Custom
            </Button>

            <Button
              variant="outline-secondary"
              className="rounded-pill"
              onClick={() => setRejectAllStudentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Rejection Reason  */}
      <Modal
        centered
        show={customRejectionModal}
        onHide={() => setCustomRejectionModal(false)}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Modal.Header
          className="border-0"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <h4 className="text-center w-100 fw-semibold mb-0">
            ✍️ Enter Custom Reason
          </h4>
        </Modal.Header>

        <Modal.Body
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <input
            type="text"
            className="form-control shadow-sm rounded-3"
            placeholder="Enter your reason here"
            style={{
              backgroundColor: "#ffffff", // white background
              color: "#000000", // black text
              border: "1px solid #ccc", // light gray border for definition
            }}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer
          className="border-0 d-flex justify-content-end gap-3"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
          }}
        >
          <Button
            variant="danger"
            className="rounded-pill px-4"
            onClick={() => {
              rejectAll(authority);
              setCustomRejectionModal(false);
            }}
          >
            🚫 Confirm
          </Button>
          <Button
            variant="outline-light"
            className="rounded-pill"
            onClick={() => setCustomRejectionModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApprovedStudentsTable;
