import Select, { components } from "react-select";

const CustomOption = (props) => {
  const { data, selectProps } = props;
  const { isDriver } = selectProps;
  
  // Extraer emoji y nombre buscando en el objeto original o el anidado
  const emoji = data.original?.emoji || data.original?.original?.emoji;
  const name = data.original?.original?.name || (data.original?.emoji ? data.original?.name : data.label);
  const hasEmoji = !!emoji;

  if (!isDriver) {
    return (
      <components.Option {...props}>
        <div className="select-default-option">
          {hasEmoji ? (
            <>
              <span className="emoji-flag">{emoji}</span>
              <span>{name}</span>
            </>
          ) : (
            <span>{data.label}</span>
          )}
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
  const { data, selectProps } = props;
  const { isDriver } = selectProps;
  
  const emoji = data.original?.emoji || data.original?.original?.emoji;
  const name = data.original?.original?.name || (data.original?.emoji ? data.original?.name : data.label);
  const hasEmoji = !!emoji;

  // Si NO es piloto ni equipo, manejamos el renderizado estándar o con emoji
  if (!isDriver) {
    return (
      <components.SingleValue {...props}>
        <div className="select-default-option">
          {hasEmoji ? (
            <>
              <span className="emoji-flag">{emoji}</span>
              <span>{name}</span>
            </>
          ) : (
            data.label
          )}
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
  isDriver = false,
  placeholder = "Seleccionar...",
  getOptionDisabled = () => false,
}) {
  const formattedOptions = options.map(opt => ({
    value: opt._id,
    label: opt.name || opt.gp_name || opt.full_name,
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
      isDriver={isDriver}
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
