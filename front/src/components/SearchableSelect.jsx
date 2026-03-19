import Select, { components } from "react-select";

const CustomOption = (props) => {
  const { data } = props;
  const isDriverOrTeam = !!data.teamName || (!!data.color && data.color !== "#ccc");

  if (!isDriverOrTeam) {
    return (
      <components.Option {...props}>
        <div className="select-default-option">
          <span>{data.label}</span>
        </div>
      </components.Option>
    );
  }

  const fullName = data.label || "";
  const nameParts = fullName.split(" ");
  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return (
    <components.Option {...props}>
      <div className="select-driver-option">
        {data.color && data.color !== "#ccc" && (
          <div
            className="select-driver-color"
            style={{ backgroundColor: data.color }}
          />
        )}
        <div className="select-driver-info">
          <span className="select-driver-first">{firstName}</span>
          <span className="select-driver-last">{lastName}</span>
          {data.teamName && <span className="select-driver-team">{data.teamName}</span>}
        </div>
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props) => {
  const { data } = props;
  const isDriverOrTeam = !!data.teamName || (!!data.color && data.color !== "#ccc");

  if (!isDriverOrTeam) {
    return (
      <components.SingleValue {...props}>
        <div className="select-default-option">
          <span>{data.label}</span>
        </div>
      </components.SingleValue>
    );
  }

  const fullName = data.label || "";
  const nameParts = fullName.split(" ");
  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return (
    <components.SingleValue {...props}>
      <div className="select-driver-option">
        {data.color && data.color !== "#ccc" && (
          <div
            className="select-driver-color"
            style={{ backgroundColor: data.color }}
          />
        )}
        <div className="select-driver-info">
          <span className="select-driver-first">{firstName}</span>
          <span className="select-driver-last">{lastName}</span>
          {data.teamName && <span className="select-driver-team">{data.teamName}</span>}
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
    color: opt.color || "#ccc",
    timezone: opt.timezone || ""
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
      }}
    />
  );
}

export default SearchableSelect;
