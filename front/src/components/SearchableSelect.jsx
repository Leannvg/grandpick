import Select, { components } from "react-select";

const CustomOption = (props) => {
  const { data } = props;
  const fullName = data.label || "";
  const nameParts = fullName.split(" ");
  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return (
    <components.Option {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            backgroundColor: data.color || "#ccc",
            borderRadius: "2px"
          }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "14px", fontWeight: 300, color: "#333" }}>{firstName}</span>
          <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", color: "#333" }}>{lastName}</span>
          <span style={{ fontSize: "12px", color: "#999", fontWeight: 300, marginLeft: "4px" }}>{data.teamName}</span>
        </div>
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props) => {
  const { data } = props;
  const fullName = data.label || "";
  const nameParts = fullName.split(" ");
  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return (
    <components.SingleValue {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            backgroundColor: data.color || "#ccc",
            borderRadius: "2px"
          }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "14px", fontWeight: 300, color: "#333" }}>{firstName}</span>
          <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", color: "#333" }}>{lastName}</span>
          <span style={{ fontSize: "12px", color: "#999", fontWeight: 300, marginLeft: "4px" }}>{data.teamName}</span>
        </div>
      </div>
    </components.SingleValue>
  );
};

function SearchableSelect({
  options = [],
  value,
  onChange,
  isInvalid = false,
  isDisabled = false,
  placeholder = "Seleccionar...",
  getOptionDisabled = () => false,
}) {
  const formattedOptions = options.map(opt => ({
    value: opt._id,
    label: opt.name || opt.gp_name,
    isDisabled: getOptionDisabled(opt),
    original: opt,
    teamName: opt.teamName || "",
    color: opt.color || "#ccc"
  }));

  const currentValue = formattedOptions.find(o => o.value === value) || null;

  return (
    <Select
      className={`react-select-container ${isInvalid ? "is-invalid" : ""}`}
      classNamePrefix="react-select"
      value={currentValue}
      onChange={(selected) => onChange(selected)}
      options={formattedOptions}
      isSearchable={true}
      isDisabled={isDisabled}
      isOptionDisabled={(opt) => opt.isDisabled}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      menuPlacement="auto"
      blurInputOnSelect={true}
      openMenuOnFocus={true}
      components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
      filterOption={(option, inputValue) => {
        const label = option.label.toLowerCase();
        const team = (option.data.teamName || "").toLowerCase();
        const search = inputValue.toLowerCase();
        return label.includes(search) || team.includes(search);
      }}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, color: '#333' }),
        control: (base) => ({
          ...base,
          minHeight: '32px',
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer'
        }),
        valueContainer: (base) => ({ ...base, padding: '0 8px' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (base) => ({ ...base, color: '#333', padding: '4px' }),
        placeholder: (base) => ({ ...base, color: '#999', fontWeight: 300, fontSize: '14px' }),
        singleValue: (base) => ({ ...base, margin: 0 }),
      }}
    />
  );
}

export default SearchableSelect;
