import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Slide,
  Step,
  StepLabel,
  Stepper,
  TextField as TextFieldMUI,
  Typography,
} from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  CancelRounded,
  CheckCircleRounded,
  CloseRounded,
  EditRounded,
  ErrorRounded,
  PersonAddAltRounded,
  PersonRemoveAlt1Rounded,
} from "@mui/icons-material";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useNavigate,
} from "react-router-dom";
import { TokenContext } from "../providers/TokenProvider";
import shareProjectsSvg from "../assets/images/share-projects.svg";
import React from "react";
import { LoadingButton, TabContext, TabPanel } from "@mui/lab";
import axiosClient from "../utils/axios";
import { login } from "../api/login";
import { TokenContextProps } from "../types/providers";
import { sendRegistrationOTP, verifyRegistrationOTP } from "../api/otp";
import {
  hasLowercaseLetter,
  hasNumber,
  hasSpecialCharacter,
  hasUppercaseLetter,
  validEmail,
} from "../utils/validator";

const RFormDataContext = createContext<RegisterFDataProps | null>(null);
const ModalAlertContext = createContext<ModalAlertContextProps | null>(null);
const steps = [
  "Personal Infortmation",
  "User Credential",
  "Email Verification",
  "Suggested Accounts and Interests",
];

const TextField = styled(TextFieldMUI)(() => ({
  "& .MuiFormHelperText-root": {
    textAlign: "right",
  },
}));

export default function Login() {
  const theme = useTheme();
  const [registerModalView, setRegisterModalView] = useState(false);

  const handleRegisterModalView = (
    _e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setRegisterModalView(true);
  };

  return (
    <div className="login flex flex-col bg-white">
      <nav>
        <div className="logo-container">
          <img
            className="logo ml-10 size-48"
            src={`${process.env.SERVER_PUBLIC}/assets/logo_label.svg`}
            alt=""
          />
        </div>
        {/* <div className="register-nav">
          <Typography
            className="register-text"
            variant="h6"
            color={theme.palette.text.primary}
          >
            No account registered ?
          </Typography>
          <Button
            className="register-button normal-case"
            variant="text"
            color={"primary"}
            onClick={handleRegisterModalView}
          >
            Register
          </Button>
        </div> */}
      </nav>
      <main>
        <div className="pane1">
          <div className="content-container">
            <img className="content-svg" src={shareProjectsSvg} alt="" />
            <Typography
              className="content-title mb-4 font-poppins font-semibold"
              variant="h4"
            >
              Share your project
            </Typography>
            <Typography
              className="content-subtitle text-center font-poppins text-sm leading-relaxed"
              variant="subtitle1"
            >
              Exhibit creation, seek advice on a challenging project, or simply
              revel in the camaraderie of fellow artisans, UniWood's "Share
              Projects" is your portal to a collaborative woodworking experience
              like never before. Let the journey of craftsmanship and connection
              begin!
            </Typography>
          </div>
        </div>
        <LoginForm setRegisterModalView={setRegisterModalView} />
        <RegisterModal
          registerModalView={registerModalView}
          setRegisterModalView={setRegisterModalView}
        />
      </main>
    </div>
  );
}

function RegisterModal({
  registerModalView,
  setRegisterModalView,
}: RegisterModalProps) {
  const navigate = useNavigate();
  const { accessToken } = useContext(TokenContext)!;
  const [stepValue, dispatchStepValue] = useReducer(stepReducer, 0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [pickedRecs, setPickedRecs] = useState<string[]>([]);
  const [alertState, setAlertState] = useState<AlertStateProps>({
    severity: "success",
    message: "Account Created",
    visible: false,
  });
  const formDataRef = useRef<FormData>(new FormData());
  const initializeRecommendations = () => {
    axiosClient
      .get("/posts/topTags?count=30", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res: any) => {
        if (res.status === 200) {
          setRecommendations(Object.keys(res.data.data));
        }
      });
  };

  const autoAlertRemoval = () => {
    setTimeout(() => {
      setAlertState({ ...alertState, visible: false });
    }, 4000);
  };
  const addInterests = () =>
    axiosClient.patch(
      "/users/addInterest",
      { interests: pickedRecs },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

  const goToHomePage = () => {
    addInterests();
    navigate("/");
  };

  useEffect(initializeRecommendations, []);
  useEffect(autoAlertRemoval, [alertState.visible]);

  return (
    <Modal
      className="login-modal flex items-center justify-center"
      open={registerModalView}
      onClose={() => setRegisterModalView(false)}
    >
      <RFormDataContext.Provider value={formDataRef}>
        <ModalAlertContext.Provider value={{ setAlert: setAlertState }}>
          <div className=" signup-modal bg relative  grid h-[90%] max-h-[750px] w-[500px] grid-rows-[auto_auto_auto] flex-col rounded-xl  bg-white pb-0 shadow-md ">
            <ModalHeader setRegisterModalView={setRegisterModalView} />
            <RegisterStepper step={stepValue} />
            <div className="h-full overflow-y-auto">
              <TabContext value={stepValue.toString()}>
                <TabPanel className="p-0" value="0">
                  <ImageForm />
                  <PersonalInfoForm
                    stepValue={stepValue}
                    dispatchStepValue={dispatchStepValue}
                  />
                </TabPanel>
                <TabPanel className="h-full p-0" value="1">
                  <CredentialForm
                    dispatchStepValue={dispatchStepValue}
                    setAlert={setAlertState}
                  />
                </TabPanel>
                <TabPanel className="h-full p-0" value="2">
                  <VerificationForm
                    dispatchStepValue={dispatchStepValue}
                    setAlert={setAlertState}
                  />
                </TabPanel>
                <TabPanel className="p-8" value="3">
                  <RecommendedAccounts />
                  <RecommendedSelect
                    recommendations={recommendations}
                    pickedRecs={pickedRecs}
                    setPickedRecs={setPickedRecs}
                  />
                  <Button
                    className="ml-auto mt-2 block w-fit rounded-md bg-primary-400 px-3 py-2 text-base font-semibold normal-case text-white hover:bg-primary-500"
                    variant="contained"
                    onClick={goToHomePage}
                  >
                    Go to Home Page
                  </Button>
                </TabPanel>
              </TabContext>
            </div>
          </div>

          <Fade in={alertState.visible}>
            <Alert
              className="absolute bottom-6 left-14 z-50 w-[250px]"
              severity={alertState.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAlertState({ ...alertState, visible: false });
                  }}
                >
                  <CloseRounded fontSize="inherit" />
                </IconButton>
              }
            >
              {alertState.message}
            </Alert>
          </Fade>
        </ModalAlertContext.Provider>
      </RFormDataContext.Provider>
    </Modal>
  );
}

function LoginForm({
  setRegisterModalView,
}: {
  setRegisterModalView: Dispatch<SetStateAction<boolean>>;
}) {
  // States
  const { setAccessToken } = useContext(TokenContext) as TokenContextProps;
  const actionData = useActionData() as any;
  const navigate = useNavigate();
  const [inputError, setInputError] = useState({
    usernameOrEmail: "",
    password: "",
  });

  //utilitiees
  const handleLoginRequestData = () => {
    if (actionData?.status === "success") {
      setAccessToken(actionData?.data?.token);
      localStorage.setItem("accessToken", actionData?.accessToken);
      localStorage.setItem("id", actionData?.id);

      navigate("/");
    } else if (actionData?.status === "fail") {
      if (actionData.error === "FieldError") {
        (actionData.error as [{ field: string; message: string }]).forEach(
          (error) => {
            if (error.field === "usernameOrEmail")
              setInputError({ ...inputError, usernameOrEmail: error.message });
            else if (error.field === "password")
              setInputError({
                ...inputError,
                password: error.message,
              });
          },
        );
      }
      if (actionData.error === "UserNotFound") {
        setInputError({
          ...inputError,
          usernameOrEmail: "User not found",
        });
      }
      if (actionData.error === "IncorrectPassword") {
        setInputError({
          ...inputError,
          password: "Incorrect Password",
        });
      }
    }
  };

  const handleClearInputError = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError({ ...inputError, [e.currentTarget.name]: "" });
  };

  useEffect(handleLoginRequestData, [actionData]);

  return (
    <Form action="/login" method="POST" className="pane2">
      <Typography className="header" variant="h4" fontFamily={"Roboto"}>
        Login
      </Typography>
      <TextField
        className="textfield mb-[10px]"
        InputLabelProps={{ shrink: true }}
        type="email"
        variant="standard"
        name="usernameOrEmail"
        label="Email"
        color="secondary"
        required
        fullWidth
        helperText={inputError.usernameOrEmail || " "}
        onChange={handleClearInputError}
        error={inputError.usernameOrEmail ? true : false}
      />
      <TextField
        className="textfield"
        required
        InputLabelProps={{ shrink: true }}
        type="password"
        variant="standard"
        name="password"
        label="Password"
        helperText={inputError.password || " "}
        color="secondary"
        fullWidth
        error={inputError.password ? true : false}
        onChange={handleClearInputError}
      />
      <Link
          to={"/forgot"}
          className="md:text-sm sm:text-based mb-[20px] text-blue-800 hover:text-blue-500"
        >
          Forgot Password? Click here
        </Link>
      <Button
        type="submit"
        className="login-button mb-[15px] block font-bold normal-case text-white"
        variant="contained"
        color={"primary"}
        fullWidth
      >
        Login
      </Button>
      <div className="or-container mb-[15px]">
        <span className="line"></span>
        <Typography fontFamily={"Roboto"}>OR</Typography>
        <span className="line"></span>
      </div>
      <Button
        className="login-button mb-[15px] block font-bold normal-case text-white"
        variant="contained"
        color={"secondary"}
        fullWidth
        onClick={() => setRegisterModalView(true)}
      >
        Register
      </Button>
    </Form>
  );
}

function ModalHeader({ setRegisterModalView }: ModalHeaderProps) {
  return (
    <div className="header-container sticky top-0 z-50 flex items-center bg-white px-2 py-3">
      <IconButton
        className="/  absolute left-2 hover:bg-gray-500 hover:bg-opacity-40"
        onClick={() => setRegisterModalView(false)}
      >
        <CloseRounded className="icon" />
      </IconButton>
      <p className="name block w-full text-center font-header text-lg font-semibold">
        Create Account
      </p>
    </div>
  );
}

function PersonalInfoForm({
  stepValue,
  dispatchStepValue,
}: PersonalInfoFormProp) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const rFormData = useContext(RFormDataContext)!;
  const [genderSelect, setGenderSelect] = useState("");
  const [affiliationSelect, setAffiliationSelect] = useState("");
  const [userInfo, setUserInfo] = useState<any>({});

  const initializeStateFormData = () => {
    if (!rFormData.current) return;

    const userInfo: any = {};

    rFormData.current.forEach((value, key) => {
      userInfo[key] = value;

      if (key === "affiliation") setAffiliationSelect(value as string);
      if (key === "gender") setGenderSelect(value as string);
    });

    setUserInfo(userInfo);
  };

  const handleTexfieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSelectGenderChange = (e: SelectChangeEvent<string>) => {
    setGenderSelect(e.target.value);
  };
  const handleSelectAffiliationChange = (e: SelectChangeEvent<string>) => {
    setAffiliationSelect(e.target.value);
  };
  const attachFormToRForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formIteratable = formData.entries();

    let formDataEntry = formIteratable.next();

    while (!formDataEntry.done) {
      const [key, value] = formDataEntry.value;
      rFormData.current.append(key, value);
      formDataEntry = formIteratable.next();
    }
    dispatchStepValue("next");
  };

  const hiddenStatus = stepValue === 0 ? "block" : "hidden";

  const centralLuzonData = {
    'Aurora': {
      'Baler': ['Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV'],
      'Casiguran': ['Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV'],
      'Dilasag': ['Esperanza', 'Dikapinisan', 'Dibacong', 'Dimaseset', 'Diniog', 'Laboy', 'Madayum', 'Malasin', 'Masagana', 'Poblacion'],
      'Dinalungan': ['Abuleg', 'Dibaraybay', 'Dikapintan', 'L. Pimentel', 'Mapalad', 'Napolidan', 'Poblacion', 'Zone I', 'Zone II'],
      'Dingalan': ['Aplaya', 'Butas na Bato', 'Caragsacan', 'Davildavilan', 'Ibona', 'Paltic', 'Poblacion', 'San Vicente', 'Tanawan', 'Umiray'],
      'Dipaculao': ['Dibutunan', 'Dinadiawan', 'Borlongan', 'Gupa', 'Liberty', 'Maligaya', 'Poblacion', 'Esteves', 'Buenavista', 'San Isidro'],
      'Maria Aurora': ['Bagtu', 'Baubo', 'Bayanihan', 'Decoliat', 'Diaz', 'Diaz-Lupa', 'Dimabuno', 'Kadayakan', 'Malasin', 'Punglo'],
      'San Luis': ['Dimanayat', 'Dibalo', 'Lipay', 'Diteki', 'Nonong', 'Poblacion', 'Santa Rosa', 'Zaragoza']
  },
  'Bataan': {
    'Abucay': ['Bangkal', 'Calaylayan', 'Gorda', 'Laon', 'Mabatang', 'Omboy', 'Salapungan', 'Santo Niño'],
    'Bagac': ['Atilano L. Ricardo', 'Bagumbayan', 'Banawang', 'Binuangan', 'Ibaba', 'Parang', 'Paysawan', 'Pag-asa', 'Quinawan', 'Tabing-Ilog'],
    'Balanga': ['Bagong Silang', 'Cupang North', 'Cupang Proper', 'Dangcol', 'Doña Francisca', 'Ibayo', 'Malabia', 'Poblacion', 'San Jose', 'San Juan'],
    'Dinalupihan': ['Colo', 'Pagalanggang', 'Pentor', 'Pinulot', 'San Benito', 'San Isidro', 'Santa Isabel', 'Torres', 'Tuol', 'Zamora'],
    'Hermosa': ['Almacen', 'Balsik', 'Bacong', 'Burgos-San Pedro', 'Cataning', 'General Lim', 'Mabiga', 'Mabuhay', 'Palihan', 'Pulo'],
    'Limay': ['Alangan', 'Duale', 'Lamao', 'Reformista', 'Saint Francis', 'San Francisco', 'Townsite', 'Wawa'],
    'Mariveles': ['Alas-asin', 'Balon Anito', 'Baseco Country', 'Biaan', 'Cabcaben', 'Camaya', 'Malaya', 'Maligaya', 'Poblacion', 'San Carlos'],
    'Morong': ['Binaritan', 'Mabayo', 'Nagbalayong', 'Poblacion', 'Sabang', 'Tangway', 'Tucop'],
    'Orani': ['Apollo', 'Balut', 'Bayan', 'Calero', 'Centro', 'Daang-Bago', 'Kalayaan', 'Mulawin', 'Poblacion', 'Silahis'],
    'Orion': ['Balagtas', 'Bilolo', 'Calungusan', 'Daan-Bago', 'General Lim', 'Kaput', 'Lati', 'Lusungan', 'Palili', 'Puting Buhangin'],
    'Pilar': ['Ala-uli', 'Bagumbayan', 'Balut', 'Landing', 'Liyang', 'Nagwaling', 'Nagwaling Proper', 'Poblacion', 'San Isidro', 'Santa Rosa'],
    'Samal': ['East Calaguiman', 'Gugo', 'Ibaba', 'Lalawigan', 'Palili', 'Samat', 'Sapa', 'Santa Lucia', 'Santa Monica', 'Tabing-Ilog']
},
'Bulacan': {
  'Malolos': ['Anilao', 'Atlag', 'Bagna', 'Balayong', 'Balite', 'Bangkal'],
  'Meycauayan': ['Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo', 'Caingin'],
  'Baliuag': ['Bagong Nayon', 'Barangca', 'Calantipay', 'Catulinan', 'Concepcion', 'Makinabang'],
  'Bocaue': ['Antipona', 'Bagumbayan', 'Bambang', 'Batia', 'Biñang 1st', 'Biñang 2nd'],
  'Bulakan': ['Bagumbayan', 'Bambang', 'Balubad', 'Matungao', 'Perez', 'Pitpitan'],
  'Hagonoy': ['Abulalas', 'Iba', 'Iba-Ibayo', 'Palapat', 'Pugad', 'San Agustin'],
  'Marilao': ['Abangan Norte', 'Abangan Sur', 'Ibayo', 'Loma de Gato', 'Nagbalon', 'Poblacion I'],
  'Norzagaray': ['Bangkal', 'Baraka', 'Bigte', 'Minuyan', 'Poblacion', 'San Mateo'],
  'Obando': ['Binuangan', 'Lawa', 'Pag-asa', 'Paliwas', 'Pansumaloc', 'Poblacion'],
  'Plaridel': ['Agnaya', 'Bagong Silang', 'Banga 1st', 'Banga 2nd', 'Bintog', 'Bunsuran 1st'],
  'Pulilan': ['Balatong A', 'Balatong B', 'Cutcot', 'Dampol 1st', 'Dampol 2nd', 'Dulong Malabon'],
  'San Ildefonso': ['Alagao', 'Anyatam', 'Balatong A', 'Balatong B', 'Bancal', 'Basuit'],
  'San Jose del Monte': ['Bagong Buhay I', 'Bagong Buhay II', 'Citrus', 'Dulong Bayan', 'Fatangas', 'Francisco Homes-Guijo'],
  'Santa Maria': ['Bagbaguin', 'Balasing', 'Buenavista', 'Bulac', 'Camangyanan', 'Catmon']
},
'Nueva Ecija': {
  'Cabanatuan': ['Bagong Sikat', 'Bakero', 'D.S. Garcia', 'General Luna', 'Hermogenes Concepcion', 'Imelda'],
  'Gapan': ['Balante', 'Bayanihan', 'Bungo', 'Caridad Norte', 'Caridad Sur', 'Kapitangan'],
  'San Jose': ['A. Pascual', 'Abar 1st', 'Abar 2nd', 'Adorable', 'Bagong Sikat', 'Barangay 1'],
  'Palayan': ['Aulo', 'Bagong Buhay', 'Caimito', 'Doña Josefa', 'Ganaderia', 'Imelda Valley'],
  'Santa Rosa': ['Avenida', 'Burgos', 'Cruz', 'Del Pilar', 'Isla', 'La Fuente'],
  'Talavera': ['Andal Alino', 'Bagong Sikat', 'Bakero', 'Bantug', 'Bugtong na Buli', 'Calipahan'],
  'San Leonardo': ['Baliuag', 'Bancal', 'Bantug', 'Bonifacio', 'Castellano', 'Diverse'],
  'General Tinio': ['Bago', 'Concepcion', 'Natividad', 'Padolina', 'Poblacion East', 'Rio Chico'],
  'Peñaranda': ['Callos', 'Las Piñas', 'Poblacion 1', 'Poblacion 2', 'Santo Tomas', 'Sinasajan'],
  'Zaragoza': ['Concepcion', 'Del Pilar', 'Esperanza', 'La Purisima', 'Manggahan', 'San Rafael'],
  'Quezon': ['Bayanan', 'Bicos', 'Doña Lucia', 'Kabisera 1', 'Kabisera 10', 'Kabisera 11'],
  'Licab': ['Avenida', 'Bantug', 'Dilaing Bato', 'Lourdes', 'San Cristobal', 'Tabing Ilog'],
  'Jaen': ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6'],
  'Guimba': ['Adorable', 'Bantug', 'Banitan', 'Camiing', 'Cavite', 'Macamias'],
  'Aliaga': ['Betes', 'Bibiclat', 'Bucot', 'La Purisima', 'Poblacion East 1', 'San Eustacio'],
  'Nampicuan': ['Ambitacay', 'Bantug', 'Cabugao', 'East Central', 'Mayantoc', 'West Central'],
  'Carranglan': ['Baluarte', 'Bantug', 'Bunga', 'Digdig', 'Gundaway', 'T. Syquia'],
  'Llanera': ['Bagumbayan', 'Caridad Norte', 'Caridad Sur', 'Ligaya', 'San Felipe', 'Victoria'],
  'Pantabangan': ['Cadaclan', 'Callejon', 'East Poblacion', 'Liberty', 'Malbang', 'Napon-Napon'],
  'Cuyapo': ['Baloy', 'Bantug', 'Bantug West', 'Bonifacio', 'Cabrera', 'Nagmisaan'],
  'Gabaldon': ['Bagong Sikat', 'Bantug', 'Calabasa', 'Ligaya', 'Pantoc', 'Tagumpay']
},
'Pampanga': {
  'Angeles': ['Agapito del Rosario', 'Amsic', 'Anunas', 'Balibago', 'Capaya', 'Claro M. Recto'],
  'San Fernando': ['Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Dela Paz Norte', 'Dela Paz Sur'],
  'Apalit': ['Balucuc', 'Calantipe', 'Cansinala', 'Capalangan', 'Paligui', 'San Juan'],
  'Arayat': ['Arenas', 'Baliti', 'Candating', 'Cupang', 'Gatiawin', 'Lacmit'],
  'Bacolor': ['Balas', 'Cabalantian', 'Cabetican', 'Calibutbut', 'Dolores', 'San Antonio'],
  'Candaba': ['Bambang', 'Barit', 'Buena Vista', 'Dalayap', 'Gulap', 'Mandasig'],
  'Floridablanca': ['Anon', 'Apalit', 'Basa Air Base', 'Benigno', 'Consuelo', 'San Antonio'],
  'Guagua': ['Ascomo', 'Bancal', 'Dila-Dila', 'Jose Abad Santos', 'Lambac', 'San Rafael'],
  'Lubao': ['Bancal Sinubli', 'Calangain', 'Concepcion', 'Del Carmen', 'Remedios', 'San Agustin'],
  'Mabalacat': ['Atlu-Bola', 'Cacutud', 'Camachiles', 'Dapdap', 'Mabiga', 'San Francisco'],
  'Macabebe': ['Caduang Tete', 'Castuli', 'Consuelo', 'Dalayap', 'San Gabriel', 'Saplad David'],
  'Magalang': ['Ayala', 'Camias', 'Escaler', 'Navaling', 'San Agustin', 'Santa Lucia'],
  'Masantol': ['Bagang', 'Bebe Anac', 'Bebe Matua', 'San Isidro Matua', 'San Nicolas', 'Santo Rosario'],
  'Mexico': ['Anao', 'Balas', 'Bamban', 'Buenaventura', 'Camuning', 'Lagundi'],
  'Minalin': ['Bulac', 'Dawe', 'Lourdes', 'San Francisco 1st', 'San Pedro', 'Santa Maria'],
  'Porac': ['Camias', 'Cangatba', 'Dolores', 'Hacienda Dolores', 'Inararo', 'Manibaug Libutad'],
  'San Luis': ['San Agustin', 'San Carlos', 'San Isidro', 'San Jose', 'San Juan', 'Santa Cruz'],
  'San Simon': ['Concepcion', 'De La Paz', 'San Agustin', 'San Isidro', 'San Juan', 'Santa Monica'],
  'Santa Ana': ['San Agustin', 'San Bartolome', 'San Isidro', 'San Joaquin', 'San Jose', 'Santa Lucia'],
  'Santa Rita': ['Becuran', 'Dila-Dila', 'San Agustin', 'San Basilio', 'San Isidro', 'Santa Monica'],
  'Santo Tomas': ['Moras De La Paz', 'Poblacion', 'San Bartolome', 'San Matias', 'San Vicente', 'Santo Rosario'],
  'Sasmuan': ['Batang 1st', 'Batang 2nd', 'Mabuanbuan', 'Malusac', 'San Antonio', 'Santa Lucia']
},
'Tarlac': {
  'Tarlac City': ['Aguso', 'Armenia', 'Atioc', 'Balanti', 'Banaba', 'Batang-Batang'],
  'Capas': ['Aranguren', 'Bueno', 'Calingcuan', 'Cubcub', 'Cutcut I', 'Cutcut II'],
  'Anao': ['Baguindoc', 'Campos', 'Cayabas', 'Don Ramon', 'Hernando', 'San Juan'],
  'Bamban': ['Anupul', 'Banaba', 'Dolores', 'La Paz', 'San Nicolas', 'San Pedro'],
  'Camiling': ['Anoling', 'Bacaba', 'Bilad', 'Cabanabaan', 'Cabayaoasan', 'Lasong'],
  'Concepcion': ['Balutu', 'Culate', 'Dela Paz', 'Lourdes', 'San Agustin', 'Tinang'],
  'Gerona': ['Abagon', 'Amacalan', 'Bacooc', 'Calayaan', 'Dona Marcelina', 'Poblacion 1'],
  'La Paz': ['Atlu-Bola', 'Balite', 'Caut', 'Caut Norte', 'Dumarais', 'San Isidro'],
  'Mayantoc': ['Barangobong', 'Bigbiga', 'Carabaoan', 'Labney', 'Mamonit', 'Sula'],
  'Moncada': ['Abagon', 'Aringin', 'Camangaan', 'Inanlorenza', 'San Julian', 'Tumana'],
  'Paniqui': ['Abogado', 'Bani', 'Cabayaoasan', 'Coral', 'Estacion', 'Rizal'],
  'Pura': ['Bacolor', 'Buenavista', 'Estipona', 'Linao', 'Maasin', 'Singat'],
  'Ramos': ['Corazon De Jesus', 'Poblacion Center', 'San Juan', 'San Raymundo', 'Santa Rita', 'Toledad'],
  'San Clemente': ['Casipo', 'Daldalayap', 'Delfino', 'Maasin', 'Nagascan', 'Poblacion Norte'],
  'San Jose': ['Aklang San Jose', 'Iba', 'Labney', 'Lawacamulag', 'Moriones', 'San Juan De Valdez'],
  'San Manuel': ['Colosboa', 'Lanat', 'Legaspi', 'Mababanaba', 'San Agustin', 'San Felipe'],
  'Santa Ignacia': ['Caarosipan', 'Cabaraoan', 'Cabugbugan', 'Namagbagan', 'Padapada', 'Sosolot'],
  'Victoria': ['Balbaloto', 'Bangar', 'Batang-Batang', 'Caturay', 'San Fernando', 'San Francisco']
},
'Zambales': {
  'Iba': ['Amungan', 'Bangantalinga', 'Dirita-Baloguen', 'Lipay-Dingin-Panibuatan', 'Palanginan', 'Sampaloc'],
  'Olongapo': ['Banicain', 'Barretto', 'East Bajac-Bajac', 'Gordon Heights', 'Kalaklan', 'New Cabalan'],
  'Botolan': ['Bangan', 'Binuclutan', 'Burgos', 'Carael', 'Danacbunga', 'Maguisguis'],
  'Cabangan': ['Arew', 'Banuanbayo', 'Laoag', 'Lipay', 'Mabanglit', 'San Isidro'],
  'Candelaria': ['Babancal', 'Binabalian', 'Catol', 'Lauis', 'Malabon', 'Pinagrealan'],
  'Castillejos': ['Balaybay', 'Looc', 'Magsaysay', 'Nagbayan', 'San Agustin', 'San Juan'],
  'Masinloc': ['Baloganon', 'Bani', 'Inhobol', 'San Lorenzo', 'San Salvador', 'Taltal'],
  'Palauig': ['Alwa', 'Bacungan', 'Bato', 'Garreta', 'Liozon', 'Salaza'],
  'San Antonio': ['Antipolo', 'Bacolcol', 'Bangan', 'Burgos', 'Luna', 'San Miguel'],
  'San Felipe': ['Aplaya', 'Amagna', 'Farañal', 'Manglicmot', 'Maloma', 'Sindol'],
  'San Marcelino': ['Burgos', 'Consuelo Norte', 'Consuelo Sur', 'Nagbunga', 'San Rafael', 'Santa Rita'],
  'San Narciso': ['Alusiis', 'Beddeng', 'La Paz', 'Libertad', 'Natividad', 'San Rafael'],
  'Santa Cruz': ['Bangcol', 'Babuyan', 'Bulawon', 'Gama', 'Lipay', 'Lucapon North'],
  }
};

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
    setSelectedMunicipality('');
    setSelectedBarangay('');
  };

  const handleMunicipalityChange = (event) => {
    setSelectedMunicipality(event.target.value);
    setSelectedBarangay('');
  };

  const handleBarangayChange = (event) => {
    setSelectedBarangay(event.target.value);
  };

  useEffect(initializeStateFormData, []);

  return (
    <Slide direction="right" in={stepValue === 0}>
      <form
        className={`input-container mb-4 flex flex-col gap-0 px-6 ${hiddenStatus}`}
        onSubmit={attachFormToRForm}
      >
        <Button className="hidden" ref={submitRef} type="submit" />
        <TextField
          className="w-full"
          margin="none"
          name="firstname"
          label="Firstname"
          required
          helperText=" "
          value={userInfo.firstname ?? ""}
          onChange={handleTexfieldChange}
        />
        <TextField
          margin="none"
          name="middlename"
          label="Middle Name"
          required
          helperText=" "
          onChange={handleTexfieldChange}
          value={userInfo.middlename ?? ""}
        />
        <TextField
          name="lastname"
          label="Last Name"
          required
          helperText=" "
          onChange={handleTexfieldChange}
          value={userInfo.lastname ?? ""}
        />
        <TextField
          name="bio"
          label="Bio"
          required
          helperText=" "
          value={userInfo.bio ?? ""}
          onChange={handleTexfieldChange}
        />
        <TextField
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          helperText=" "
          required
          InputLabelProps={{
            shrink: true,
          }}
          value={userInfo.dateOfBirth ?? ""}
          onChange={handleTexfieldChange}
        />
        <FormControl fullWidth className="mb-[20px]">
          <InputLabel id="edit-profile-affiliation">Affiliation</InputLabel>
          <Select
            name="affiliation"
            labelId="edit-profile-affiliation"
            label="Affiliation"
            value={
              affiliationSelect ||
              (rFormData.current.get("affiliation") as string) ||
              ""
            }
            onChange={handleSelectAffiliationChange}
          >
            <MenuItem value="WOOD_ENTHUSIAST">Wood Enthusiast</MenuItem>
            <MenuItem value="WOOD_WORKER">Woodworker</MenuItem>
            <MenuItem value="WOOD_CRAFTER">Wood Crafter</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth className="mb-[20px]">
          <InputLabel id="edit-profile-gender">Gender</InputLabel>
          <Select
            labelId="edit-profile-gender"
            name="gender"
            label="Gender"
            value={
              genderSelect || (rFormData.current.get("gender") as string) || ""
            }
            onChange={handleSelectGenderChange}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth className="mb-[20px]">
          <InputLabel id="province-label">Province</InputLabel>
          <Select
            labelId="province-label"
            name="province"
            label="Province"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            {Object.keys(centralLuzonData).map((province) => (
              <MenuItem key={province} value={province}>
                {province}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth className="mb-[20px]" disabled={!selectedProvince}>
          <InputLabel id="municipality-label">Municipality</InputLabel>
          <Select
            labelId="municipality-label"
            name="municipality"
            label="Municipality"
            value={selectedMunicipality}
            onChange={handleMunicipalityChange}
          >
            {selectedProvince && Object.keys(centralLuzonData[selectedProvince]).map((municipality) => (
              <MenuItem key={municipality} value={municipality}>
                {municipality}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth className="mb-[20px]" disabled={!selectedMunicipality}>
          <InputLabel id="barangay-label">Barangay</InputLabel>
          <Select
            labelId="barangay-label"
            name="barangay"
            label="Barangay"
            value={selectedBarangay}
            onChange={handleBarangayChange}
          >
            {selectedMunicipality && centralLuzonData[selectedProvince][selectedMunicipality].map((barangay) => (
              <MenuItem key={barangay} value={barangay}>
                {barangay}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          className="w-12 self-end bg-primary-400 p-2 font-semibold normal-case text-white"
          type="submit"
          variant="contained"
        >
          Next
        </Button>
      </form>
    </Slide>
  );
};

function RecommendedAccounts() {
  const [accountsInfo, stetAccountsInfo] = useState<UserProfileInfo[]>([]);

  const getRecommendedAccounts = () => {
    axiosClient
      .get("users/register/recommendedAccounts", {
        params: { limit: 5 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        stetAccountsInfo(res.data.recommendedAccounts);
      });
  };

  useEffect(getRecommendedAccounts, []);
  return (
    <div className="rounded-md border-2 border-solid border-primary-300 py-4">
      <p className="mb-5 ml-5 font-header text-base font-semibold text-slate-700">
        Suggested Accounts:
      </p>
      {accountsInfo.map((account) => (
        <Account account={account} />
      ))}
    </div>
  );
}

function CredentialForm({ dispatchStepValue }: CredentialFormProps) {
  const userFetcher = useFetcher();
  const rFormData = useContext(RFormDataContext)!;
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passowrdRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [credential, setCredential] = useState<
    Partial<{
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
    }>
  >();
  const [tfErrors, setTfErrors] = useState<tfErrorsState>({
    email: null,
    username: null,
    password: null,
    confirmPassword: null,
  });

  const [emailValidity, setEmailValidity] = useState<
    "VALID" | "LOADING" | "NOTVALID" | "IDLE"
  >("IDLE");
  const [userNameValidity, setUserNameValidity] = useState<
    "VALID" | "LOADING" | "NOTVALID" | "IDLE"
  >("IDLE");
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUppercaseLetter: false,
    hasLowercaseLetter: false,
    hasNumber: false,
    hasSpecialCharacter: false,
  });

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });

    if (e.target.name === "confirmPassword") {
      if (e.target.value === "") {
        setTfErrors({ ...tfErrors, confirmPassword: null });
      }
      if (e.target.value !== credential?.password)
        setTfErrors({
          ...tfErrors,
          confirmPassword: "Password does not match",
        });
      else {
        setTfErrors({ ...tfErrors, confirmPassword: null });
      }
    } else if (e.target.name === "password") {
      // Check criteria
      let passwordCriteriaMet = 0;
      Object.values(passwordCriteria).forEach((criteria) => {
        if (criteria) passwordCriteriaMet++;
      });
      if (e.target.value.length < 8) {
        tfErrors.password = "Password must be at least 8 characters";
      } else {
        tfErrors.password = null;
        if (credential?.confirmPassword !== "") {
          if (credential?.confirmPassword !== e.target.value)
            tfErrors.confirmPassword = "Password does not match";
          else {
            tfErrors.confirmPassword = null;
          }
        }
      }
      setTfErrors({ ...tfErrors });
      setPasswordCriteria({
        hasUppercaseLetter: hasUppercaseLetter(e.target.value),
        hasLowercaseLetter: hasLowercaseLetter(e.target.value),
        hasNumber: hasNumber(e.target.value),
        hasSpecialCharacter: hasSpecialCharacter(e.target.value),
      });
    } else if (e.target.name === "username") checkIfUsernameExists(e);
    else if (e.target.name === "email") checkIfEmailExists(e);
  };

  const checkIfEmailExists = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") return setEmailValidity("IDLE");

    if (!validEmail(e.target.value)) {
      if (emailValidity !== "NOTVALID") setEmailValidity("NOTVALID");

      if (tfErrors.email !== "Invalid Email")
        setTfErrors({ ...tfErrors, email: "Invalid Email" });

      return;
    }

    setEmailValidity("LOADING");
    setTfErrors({ ...tfErrors, email: null });
    axiosClient
      .get(`/users/existEmail/${e.target.value}`)
      .then((res) => {
        if (res.data.status === "success") {
          setEmailValidity("VALID");
          setTfErrors({ ...tfErrors, email: null });
        }
      })
      .catch((err) => {
        if (err.response.status === 409 && err.response.data.errorFields) {
          setEmailValidity("NOTVALID");
          setTfErrors({ ...tfErrors, email: "Email already exists" });
        }
      });
  };

  const checkIfUsernameExists = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") return setUserNameValidity("IDLE");

    if (e.target.value.length < 4) {
      if (userNameValidity !== "NOTVALID") setUserNameValidity("NOTVALID");
      if (tfErrors.username !== "Username must be at least 4 characters")
        setTfErrors({
          ...tfErrors,
          username: "Username must be at least 4 characters",
        });
      return;
    }

    setTimeout(() => {
      setUserNameValidity("LOADING");
      setTfErrors({ ...tfErrors, username: null });
    });

    axiosClient
      .get(`/users/existUsername/${e.target.value}`)
      .then((res) => {
        if (res.data.status === "success") {
          setUserNameValidity("VALID");
          setTfErrors({ ...tfErrors, username: null });
        }
      })
      .catch((err) => {
        if (err.response.status === 409 && err.response.data.errorFields) {
          setUserNameValidity("NOTVALID");
          setTfErrors({ ...tfErrors, username: "Username already exists" });
        }
      });
  };

  const initializeCredentialState = () => {
    if (!rFormData.current) return;

    if (rFormData.current.get("email")) setEmailValidity("VALID");

    if (rFormData.current.get("username")) setUserNameValidity("VALID");

    // Check if criterio is met
    const password = rFormData.current.get("password") as string;
    setPasswordCriteria({
      hasUppercaseLetter: hasUppercaseLetter(password),
      hasLowercaseLetter: hasLowercaseLetter(password),
      hasNumber: hasNumber(password),
      hasSpecialCharacter: hasSpecialCharacter(password),
    });

    // Check if password is matched
    if (
      rFormData.current.get("password") !==
      rFormData.current.get("confirmPassword")
    ) {
      setTfErrors({ ...tfErrors, confirmPassword: "Password does not match" });
    }

    setCredential({
      email: (rFormData.current.get("email") as string) ?? "",
      username: (rFormData.current.get("username") as string) ?? "",
      password: (rFormData.current.get("password") as string) ?? "",
      confirmPassword:
        (rFormData.current.get("confirmPassword") as string) ?? "",
    });
  };

  const attachDataToForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rFormData.current) return;

    if (emailValidity !== "VALID") {
      if (!emailRef.current) return;
      emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTfErrors({ ...tfErrors, email: "Invalid Email" });
      return;
    }
    if (userNameValidity !== "VALID") {
      if (!usernameRef.current) return;
      usernameRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTfErrors({ ...tfErrors, username: "Invalid Username" });
      return;
    }
    // Check if password criteria is met
    let passwordCriteraPassCount = 0;
    Object.values(passwordCriteria).forEach((criteria) => {
      if (criteria) passwordCriteraPassCount++;
    });

    // check if password match
    if (credential?.password !== credential?.confirmPassword) {
      setTfErrors({ ...tfErrors, confirmPassword: "Password does not match" });
      return;
    }

    if (passwordCriteraPassCount < 3) {
      setTfErrors({
        ...tfErrors,
        password:
          "Password must satisfy at least 3 of the criteria mentioned above",
      });
      return;
    }

    rFormData.current.append("email", credential?.email ?? "");
    rFormData.current.append("username", credential?.username ?? "");
    rFormData.current.append("password", credential?.password ?? "");
    rFormData.current.append(
      "confirmPassword",
      credential?.confirmPassword ?? "",
    );

    dispatchStepValue("next");
  };

  const previousStep = () => dispatchStepValue("back");
  const isSubmitting = userFetcher.state === "submitting";

  useEffect(initializeCredentialState, []);

  return (
    <form
      onSubmit={attachDataToForm}
      className="relative flex w-full flex-col justify-center p-6"
    >
      <p className="mb-5 font-body text-xl font-bold tracking-wide text-slate-800">
        Setup Credential
      </p>
      <TextField
        autoComplete="off"
        className="mb-[8px]"
        ref={emailRef}
        name="email"
        label="Email"
        required
        type="email"
        helperText={tfErrors.email ?? " "}
        error={tfErrors.email ? true : false}
        onChange={handleTextFieldChange}
        fullWidth
        disabled={isSubmitting}
        value={credential?.email ?? ""}
        InputProps={
          emailValidity === "LOADING"
            ? {
                endAdornment: (
                  <CircularProgress className="text-slate-400" size={20} />
                ),
              }
            : emailValidity === "VALID"
              ? {
                  endAdornment: (
                    <CheckCircleRounded className="text-green-400" />
                  ),
                }
              : emailValidity === "NOTVALID"
                ? {
                    endAdornment: <ErrorRounded className="text-red-400" />,
                  }
                : undefined
        }
      />
      <TextField
        autoComplete="off"
        className="mb-[8px]"
        ref={usernameRef}
        name="username"
        label="Username"
        type="text"
        required
        error={tfErrors.username ? true : false}
        helperText={tfErrors.username ?? " "}
        autoFocus={tfErrors.username ? true : false}
        onChange={handleTextFieldChange}
        fullWidth
        disabled={isSubmitting}
        defaultValue={rFormData.current.get("email") ?? ""}
        value={credential?.username ?? ""}
        InputProps={
          userNameValidity === "LOADING"
            ? {
                endAdornment: (
                  <CircularProgress className="text-slate-400" size={20} />
                ),
              }
            : userNameValidity === "VALID"
              ? {
                  endAdornment: (
                    <CheckCircleRounded className="text-green-400" />
                  ),
                }
              : userNameValidity === "NOTVALID"
                ? {
                    endAdornment: <ErrorRounded className="text-red-400" />,
                  }
                : undefined
        }
      />
      <div className="relative mb-2">
        <div
          className="mb-9 rounded-md border
            border-solid border-slate-200 bg-slate-100 p-2 text-sm text-slate-600"
        >
          <p className="mb-2">
            Password must be at least 8 characters long and contains at least 3
            of the following:
          </p>
          <div className="ml-3">
            <div className="flex items-center gap-1">
              {passwordCriteria.hasUppercaseLetter ? (
                <CheckCircleRounded className="size-[22px] text-green-400" />
              ) : (
                <CancelRounded className="size-[22px] text-red-400" />
              )}
              <span>Uppercase Letters</span>
            </div>
            <div className="flex items-center gap-1">
              {passwordCriteria.hasLowercaseLetter ? (
                <CheckCircleRounded className="size-[22px] text-green-400" />
              ) : (
                <CancelRounded className="size-[22px] text-red-400" />
              )}
              <span>Lowercase Letters</span>
            </div>
            <div className="flex items-center gap-1">
              {passwordCriteria.hasNumber ? (
                <CheckCircleRounded className="size-[22px] text-green-400" />
              ) : (
                <CancelRounded className="size-[22px] text-red-400" />
              )}
              <span>Numbers</span>
            </div>
            <div className="flex items-center gap-1">
              {passwordCriteria.hasSpecialCharacter ? (
                <CheckCircleRounded className="size-[22px] text-green-400" />
              ) : (
                <CancelRounded className="size-[22px] text-red-400" />
              )}
              <span>Non-alphanumeric Characters</span>
            </div>
          </div>
        </div>
        <TextField
          ref={passowrdRef}
          name="password"
          label="Password"
          type="password"
          required
          fullWidth
          helperText={tfErrors.password ?? " "}
          error={tfErrors.password ? true : false}
          onChange={handleTextFieldChange}
          disabled={isSubmitting}
          value={credential?.password ?? ""}
        />
      </div>
      <TextField
        className="mb-[8px]"
        ref={confirmPasswordRef}
        name="confirmPassword"
        label="Confirm Password"
        required
        type="password"
        helperText={tfErrors.confirmPassword ?? " "}
        error={tfErrors.confirmPassword ? true : false}
        fullWidth
        onChange={handleTextFieldChange}
        disabled={isSubmitting}
        value={credential?.confirmPassword ?? ""}
      />

      <div className="flex justify-between">
        <Button
          className="font-body font-semibold normal-case text-white "
          variant="contained"
          onClick={previousStep}
        >
          Back
        </Button>
        <Button
          className="font-body font-semibold normal-case text-white "
          variant="contained"
          type="submit"
        >
          Next
        </Button>
      </div>
    </form>
  );
}

function stepReducer(state: number, action: "next" | "back") {
  switch (action) {
    case "next":
      return state + 1;
    case "back":
      return state - 1;
    default:
      return state;
  }
}

function VerificationForm({
  setAlert,
  dispatchStepValue,
}: VerificationFormProps) {
  // Variables
  const userFetcher = useFetcher();
  const loginFetcher = useFetcher();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRef = useRef<HTMLInputElement[]>([]);
  const [timeToResend, setTimeToResend] = useState(150);
  const [codeResendable, setCodeResendable] = useState(false);
  const codeResendInterval = useRef<NodeJS.Timeout | null>(null);
  const rFormData = useContext(RFormDataContext)!;
  const [isCodeValid, setIsCodeValid] = useState(true);

  // handlers
  const resendMail = () => {
    if (!codeResendInterval.current) return;
    clearInterval(codeResendInterval.current);
    setCodeResendable(false);
    setTimeToResend(150);
    codeResendInterval.current = setInterval(() => {
      setTimeToResend((prev) => prev - 1);
    }, 1000);

    sendMail();
  };
  const handleCodeResendInterval = () => {
    setCodeResendable(false);
    setTimeToResend(150);
    codeResendInterval.current = setInterval(() => {
      setTimeToResend((prev) => prev - 1);
    }, 1000);

    return () => {
      if (codeResendInterval.current) {
        clearInterval(codeResendInterval.current);
      }
    };
  };
  const watchCodeTimeTotResend = () => {
    if (timeToResend === 0 && codeResendInterval.current) {
      clearInterval(codeResendInterval.current);
      setCodeResendable(true);
    }
  };
  const handleValueChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isCodeValid) setIsCodeValid(true);

    if (e.key === "Backspace") {
      e.currentTarget.value = "";
      code[Number(e.currentTarget.name)] = "";
      setCode(code);

      if (Number(e.currentTarget.name) - 1 >= 0) {
        inputRef.current[Number(e.currentTarget.name) - 1].focus();
      }
    } else if (e.key.match(/^[a-zA-Z0-9]$/)) {
      e.currentTarget.value = e.key;
      code[Number(e.currentTarget.name)] = e.key;
      setCode(code);

      if (Number(e.currentTarget.name) <= 4)
        inputRef.current[Number(e.currentTarget.name) + 1].focus();
      else inputRef.current[Number(e.currentTarget.name)].blur();
    }
  };
  const previousStep = () => dispatchStepValue("back");
  const sendMail = () => {
    if (rFormData.current.get("email") === null) return;
    sendRegistrationOTP({
      email: rFormData.current.get("email") as string,
    });
  };
  const handleFormSubmit = async () => {
    // Verify if registration code is valid
    if (
      !(await verifyRegistrationOTP({
        email: rFormData.current.get("email") as string,
        otp: code.join(""),
      }))
    )
      return setIsCodeValid(false);

    // Register User
    if (!rFormData.current) return;
    userFetcher.submit(rFormData.current, {
      method: "POST",
      action: "/users",
      encType: "multipart/form-data",
    });
  };
  const handleRegisterStatusAlert = () => {
    if (userFetcher.data?.status === "success") {
      setAlert({
        severity: "success",
        message: "Account Created",
        visible: true,
      });
    } else if (userFetcher.data?.status === "fail") {
      setAlert({
        severity: "error",
        message: "Account not created",
        visible: true,
      });
    }
  };

  const handleUserFetcherResponse = () => {
    // Check if loginFetcher is used
    if (!userFetcher.data) return;

    // Check if login reponse is not sucessfull
    if (userFetcher.data?.status !== "success" && userFetcher.data != null) {
      console.error(userFetcher.data.response);
      setAlert({
        visible: true,
        severity: "error",
        message: "Error creating an account",
      });
    }

    // Login User
    setAlert({
      visible: true,
      severity: "success",
      message: "Account Created",
    });

    if (!rFormData.current.get("email") || !rFormData.current.get("password")) {
      setAlert({
        visible: true,
        severity: "error",
        message: "Missing Credentials",
      });
      console.error("Email or Password not found in the form");
      return;
    }
    loginFetcher.submit(
      {
        usernameOrEmail: rFormData.current.get("email") as string,
        password: rFormData.current.get("password") as string,
      },
      {
        action: "/login",
        method: "POST",
      },
    );
  };
  const handleLoginFetcherResponse = () => {
    if (loginFetcher.data?.status === "success") {
      localStorage.setItem("accessToken", loginFetcher.data.accessToken);
      localStorage.setItem("id", loginFetcher.data.id);
      dispatchStepValue("next");
    }
  };

  useEffect(handleCodeResendInterval, []);
  useEffect(watchCodeTimeTotResend, [timeToResend]);
  useEffect(sendMail, []);
  useEffect(handleUserFetcherResponse, [userFetcher.data]);
  useEffect(handleLoginFetcherResponse, [loginFetcher.data]);

  return (
    <div className="flex h-full flex-col justify-center gap-2 px-10 py-20">
      <p className="mb-3 text-center font-header text-lg font-bold text-slate-800">
        Account Verification
      </p>
      <p className="= mb-5 text-center font-body text-base text-slate-800">
        Enter code sent to{" "}
        <span className="italic ">
          {rFormData.current.get("email") as string}{" "}
        </span>
        <span
          className="text-[.75rem] hover:cursor-pointer hover:text-blue-500 hover:underline"
          onClick={previousStep}
        >
          Change
        </span>
      </p>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            type="text"
            ref={(el) => el && (inputRef.current[i] = el)}
            className={`h-[64px]  w-[48px] rounded-lg border border-solid ${isCodeValid ? "border-slate-300" : "border-red-500"} text-center font-body text-2xl font-bold text-slate-800`}
            maxLength={1}
            name={`${i}`}
            onKeyUp={handleValueChange}
          />
        ))}
      </div>

      <p className="mb-4 text-center font-body text-xs text-red-500">
        {isCodeValid ? " " : "Invalid Verification Code"}
      </p>

      {codeResendable && (
        <p className="mb-5 text-center font-body text-sm text-slate-800">
          Didn't receive the code?{" "}
          <span
            className="text-blue-600 underline hover:cursor-pointer hover:underline"
            onClick={resendMail}
          >
            Resend Code
          </span>
        </p>
      )}
      {!codeResendable && <TimerComponent seconds={timeToResend} />}
      <Button
        className="font-body text-base font-bold normal-case text-white"
        variant="contained"
        onClick={handleFormSubmit}
      >
        Create Account
      </Button>
    </div>
  );
}

// Sub Components
function RegisterStepper({ step }: RegisterStepperProps) {
  return (
    <div className=" z-10 w-full border-b-4  border-solid  border-primary-300 bg-primary-50 py-2">
      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

function TimerComponent({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = (seconds % 60).toString().padStart(2, "0");
  return (
    <p className="mb-5 text-center font-body text-sm text-slate-800">
      Resend code in {minutes !== 0 ? `${minutes}:` : ""}
      {parseInt(secondsLeft) !== 0 ? secondsLeft : "00"}
    </p>
  );
}

function ImageForm() {
  const rFormData = useContext(RFormDataContext)!;
  const [userImg, setUserImg] = useState<UserImageState>({
    cover: null,
    pfp: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null || !(e.target.files[0] instanceof File)) return;
    const file = e.target.files[0];

    rFormData.current.append(e.currentTarget.name, file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setUserImg({
        ...userImg,
        [e.target.name]: reader.result?.toString() ?? null,
      });
    };
  };
  const displaySelectedImage = () => {
    if (rFormData.current.get("pfp") !== null) {
      const reader = new FileReader();
      reader.readAsDataURL(rFormData.current.get("pfp") as File);
      reader.onload = () => {
        setUserImg((prev) => ({
          ...prev,
          pfp: reader.result?.toString() ?? null,
        }));
      };
    }
    if (rFormData.current.get("cover") !== null) {
      const reader = new FileReader();
      reader.readAsDataURL(rFormData.current.get("cover") as File);
      reader.onload = () => {
        setUserImg((prev) => ({
          ...prev,
          cover: reader.result?.toString() ?? null,
        }));
      };
    }
  };

  useEffect(displaySelectedImage, []);

  return (
    <div className="relative mb-[65px] flex w-full items-center justify-center ">
      <IconButton
        title="Set cover image"
        className="cover-icon-container absolute aspect-square h-full w-full rounded-none hover:bg-black hover:bg-opacity-40 "
      >
        <label
          htmlFor="edit-profile-cover"
          className="flex h-full w-full items-center justify-center hover:cursor-pointer"
        >
          <EditRounded className="icon text-white hover:cursor-pointer" />
        </label>
        <input
          id="edit-profile-cover"
          type="file"
          name="cover"
          hidden
          accept="*/image"
          onChange={handleImageChange}
        />
      </IconButton>
      <img
        className="h-[25vh] max-h-[250px] w-full bg-cover"
        src={
          userImg.cover ??
          `${process.env.SERVER_PUBLIC}/assets/default-cover.jpg`
        }
      />
      <div className="avatar-container absolute bottom-[-60px] left-[30px] flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-solid border-white">
        <Avatar
          className="avatar h-full w-full "
          src={
            userImg.pfp ?? `${process.env.SERVER_PUBLIC}/assets/default-pfp.jpg`
          }
        />
        <IconButton
          title="Set avatar"
          className="icon-container absolute  h-full w-full  hover:bg-black hover:bg-opacity-40 "
        >
          <label
            htmlFor="edit-profile-pfp"
            className="flex h-full w-full items-center justify-center hover:cursor-pointer "
          >
            <EditRounded className="icon text-white hover:cursor-pointer" />
          </label>
          <input
            id="edit-profile-pfp"
            type="file"
            name="pfp"
            hidden
            accept="*/image"
            onChange={handleImageChange}
          />
        </IconButton>
      </div>
    </div>
  );
}

function Account({ account }: { account: UserProfileInfo }) {
  const { setAccessToken } = useContext(TokenContext)!;
  const { setAlert } = useContext(ModalAlertContext)!;

  const followUser = () =>
    axiosClient.patch(
      "/users/follow",
      {},
      {
        params: { userId: account.id },
        headers: {
          Authorization: `Bearrer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
  const unfollowUser = () =>
    axiosClient.patch(
      "/users/unfollow",
      {},
      {
        params: { userId: account.id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
  const refreshToken = () => {
    axiosClient
      .post("/refresh_token", {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
      });
  };
  const [isFollowing, setIsFollowing] = useState(false);
  const follow = () => {
    followUser().then(() => {
      setAlert({ message: "Followed", severity: "success", visible: true });
      setIsFollowing(true);
    });
  };
  const unFollow = () => {
    setIsFollowing(false);
    unfollowUser().then(() => {
      setAlert({ message: "Unfollowed", severity: "success", visible: true });
      setIsFollowing(false);
    });
  };

  useEffect(refreshToken, []);
  return (
    <div className="mb-4 flex items-center gap-3 px-3">
      <Avatar
        className="size-14"
        src={`${process.env.SERVER_PUBLIC}/${account.pfp}`}
      />
      <div>
        <p className="font-body2 text-base font-medium text-slate-700 hover:cursor-pointer hover:underline">
          {account.fullname}
        </p>
        <p className="font-body text-sm text-slate-500">
          {account.affiliation}
        </p>
        <p className="font-body2 text-sm text-slate-500"></p>
        <p className="font-body2  text-sm text-slate-500">{account.address}</p>
      </div>
      {!isFollowing ? (
        <IconButton className="ml-auto" onClick={follow}>
          <PersonAddAltRounded className="text-primary-400" />
        </IconButton>
      ) : (
        <IconButton className="ml-auto">
          <PersonRemoveAlt1Rounded
            className="text-primary-400"
            onClick={unFollow}
          />
        </IconButton>
      )}
    </div>
  );
}

function RecommendedSelect({
  recommendations,
  pickedRecs,
  setPickedRecs,
}: RecommendedSelectProps) {
  const togglePickRecommendation = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const recommendation = e.currentTarget.id;
    if (pickedRecs.find((e) => e === recommendation)) {
      setPickedRecs(pickedRecs.filter((e) => e !== recommendation));
    } else {
      setPickedRecs([...pickedRecs, recommendation]);
    }
  };

  return (
    <div className={`mx-aut mt-4 rounded-lg p-2 hover:cursor-text`}>
      <p className="font-body text-lg">Interests:</p>

      <div className="mt-3 flex min-h-[163.2px] flex-wrap justify-center">
        {recommendations.map((recommend) => {
          const selected = pickedRecs.find((e) => e === recommend)
            ? "border-primary-300 bg-primary-300 hover:border-primary-400 text-white"
            : "border-primary-200 bg-primary-100 hover:border-primary-300 text-slate-700";
          return (
            <Chip
              id={recommend}
              className={`max-w flex-gow mb-1 ml-1 min-w-[10px] border-2  border-solid  text-slate-700 ${selected} hover:cursor-pointer focus-visible:border-none`}
              key={recommend}
              label={recommend}
              onClick={togglePickRecommendation}
            />
          );
        })}
      </div>
    </div>
  );
}

// Types
type RegisterFDataProps = React.MutableRefObject<FormData>;

interface VerificationFormProps {
  setAlert: Dispatch<SetStateAction<AlertStateProps>>;
  dispatchStepValue: Dispatch<"next" | "back">;
}

interface PMathcherState {
  password: string | null;
  confirmPassword: string | null;
}
interface tfErrorsState {
  email: string | null;
  username: string | null;
  password: string | null;
  confirmPassword: string | null;
}
interface CredentialFormProps {
  dispatchStepValue: Dispatch<"next" | "back">;
  setAlert: Dispatch<SetStateAction<AlertStateProps>>;
}

interface RegisterStepperProps {
  step: number;
}

interface RegisterModalProps {
  registerModalView: boolean;
  setRegisterModalView: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PersonalInfoFormProp {
  stepValue: number;
  dispatchStepValue: Dispatch<"next" | "back">;
}

interface ModalHeaderProps {
  setRegisterModalView: Dispatch<SetStateAction<boolean>>;
}

interface AlertStateProps {
  severity: "success" | "error" | "warning" | "info";
  message: string;
  visible: boolean;
}
interface UserImageState {
  cover: string | null;
  pfp: string | null;
}

interface ModalAlertContextProps {
  setAlert: Dispatch<SetStateAction<AlertStateProps>>;
}

interface RecommendedSelectProps {
  recommendations: string[];
  pickedRecs: string[];
  setPickedRecs: React.Dispatch<React.SetStateAction<string[]>>;
}
